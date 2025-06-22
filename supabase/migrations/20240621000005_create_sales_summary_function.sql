create or replace function public.calculate_user_sales_summary(p_user_id uuid)
returns table(total_revenue numeric, approved_sales bigint, pending_sales bigint, total_sales bigint)
language plpgsql
as $$
begin
  return query
  select
    coalesce(sum(case when status = 'aprovado' then price else 0 end), 0) as total_revenue,
    coalesce(count(case when status = 'aprovado' then 1 end), 0) as approved_sales,
    coalesce(count(case when status = 'pendente' then 1 end), 0) as pending_sales,
    coalesce(count(*), 0) as total_sales
  from
    public.checkout_logs
  where
    user_id = p_user_id;
end;
$$; 