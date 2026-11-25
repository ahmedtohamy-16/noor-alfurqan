CREATE OR REPLACE FUNCTION public.merge_user_json(base jsonb, patch jsonb) RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE result jsonb := COALESCE(base,'{}'::jsonb); k text; v jsonb;
BEGIN
 IF jsonb_typeof(patch) <> 'object' THEN RETURN patch; END IF;
 FOR k,v IN SELECT * FROM jsonb_each(patch) LOOP
   IF v='null'::jsonb THEN result=result-k;
   ELSIF jsonb_typeof(v)='object' AND jsonb_typeof(result->k)='object' THEN
     result=jsonb_set(result,ARRAY[k],public.merge_user_json(result->k,v),true);
   ELSE result=jsonb_set(result,ARRAY[k],v,true); END IF;
 END LOOP;
 RETURN result;
END $$;