-- Records which staff member confirmed/corrected a redemption, and an
-- optional note explaining a correction. Needed to build the confirm/
-- cancel/correct workflow — previously there were no Server Actions or
-- schema support for it at all.
alter table public.redemptions
  add column if not exists confirmed_by_staff_id uuid references public.profiles(id);

alter table public.redemptions
  add column if not exists correction_note text;
