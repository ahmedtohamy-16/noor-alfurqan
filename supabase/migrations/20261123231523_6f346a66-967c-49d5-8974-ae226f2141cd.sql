CREATE TABLE public.user_state (
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 namespace text NOT NULL,
 record_key text NOT NULL,
 payload jsonb NOT NULL DEFAULT '{}'::jsonb,
 deleted boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,namespace,record_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_state TO authenticated;
GRANT ALL ON public.user_state TO service_role;
ALTER TABLE public.user_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_state_own ON public.user_state FOR ALL TO authenticated USING(auth.uid()=user_id) WITH CHECK(auth.uid()=user_id);
CREATE FUNCTION public.touch_user_state() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
CREATE TRIGGER touch_user_state BEFORE UPDATE ON public.user_state FOR EACH ROW EXECUTE FUNCTION public.touch_user_state();
CREATE FUNCTION public.merge_user_json(base jsonb, patch jsonb) RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE result jsonb := COALESCE(base,'{}'::jsonb); k text; v jsonb;
BEGIN
 IF jsonb_typeof(patch) <> 'object' THEN RETURN patch; END IF;
 FOR k,v IN SELECT * FROM jsonb_each(patch) LOOP
   IF jsonb_typeof(v)='object' AND jsonb_typeof(result->k)='object' THEN
     result=jsonb_set(result,ARRAY[k],public.merge_user_json(result->k,v),true);
   ELSE result=jsonb_set(result,ARRAY[k],v,true); END IF;
 END LOOP;
 RETURN result;
END $$;
CREATE FUNCTION public.read_user_state() RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
 SELECT COALESCE(jsonb_agg(jsonb_build_object('namespace',namespace,'key',record_key,'payload',payload,'deleted',deleted,'updated_at',updated_at)),'[]'::jsonb) FROM public.user_state WHERE user_id=auth.uid()
$$;
CREATE FUNCTION public.sync_user_state(changes jsonb) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE item jsonb; uid uuid := auth.uid(); ns text; rk text;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 IF jsonb_typeof(changes)<>'array' OR jsonb_array_length(changes)>100 THEN RAISE EXCEPTION 'Invalid batch'; END IF;
 FOR item IN SELECT * FROM jsonb_array_elements(changes) LOOP
 ns=item->>'namespace'; rk=item->>'key';
 IF ns IS NULL OR ns !~ '^[a-z][a-z0-9_]{0,63}$' OR rk IS NULL OR length(rk)>200 OR length(rk)=0 OR jsonb_typeof(item->'payload') <> 'object' OR octet_length((item->'payload')::text)>524288 THEN RAISE EXCEPTION 'Invalid user state'; END IF;
 INSERT INTO public.user_state(user_id,namespace,record_key,payload,deleted) VALUES(uid,ns,rk,item->'payload',COALESCE((item->>'deleted')::boolean,false))
 ON CONFLICT(user_id,namespace,record_key) DO UPDATE SET payload=CASE WHEN COALESCE((item->>'replace')::boolean,false) THEN EXCLUDED.payload ELSE public.merge_user_json(user_state.payload,EXCLUDED.payload) END, deleted=EXCLUDED.deleted;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.read_user_state() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.sync_user_state(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.read_user_state(), public.sync_user_state(jsonb) TO authenticated, service_role;
ALTER TABLE public.profiles ADD COLUMN avatar_url text;
GRANT UPDATE(avatar_url) ON public.profiles TO authenticated;
GRANT SELECT(avatar_url) ON public.profiles TO authenticated;
