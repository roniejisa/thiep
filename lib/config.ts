// Publishable values identify the project; authorization is enforced by Supabase RLS.
export const supabaseConfig={
 url:process.env.NEXT_PUBLIC_SUPABASE_URL||'https://kpalhrcylytzrwxubnjf.supabase.co',
 key:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_KKys2iwM5Cjn8qPAFM72Uw_M7Lj5NQq',
};
