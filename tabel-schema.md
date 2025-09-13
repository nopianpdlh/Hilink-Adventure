

create table public.blog_posts (
  id uuid not null default gen_random_uuid (),
  title text not null,
  content text not null,
  author_id uuid null,
  published_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  slug text not null,
  constraint blog_posts_pkey primary key (id),
  constraint blog_posts_slug_key unique (slug),
  constraint blog_posts_author_id_fkey foreign KEY (author_id) references profiles (id)
) TABLESPACE pg_default;

create table public.destinations (
  id uuid not null default gen_random_uuid (),
  name character varying(255) not null,
  description text null,
  created_at timestamp with time zone null default now(),
  constraint destinations_pkey primary key (id)
) TABLESPACE pg_default;



create table public.profiles (
  id uuid not null,
  full_name text null,
  avatar_url text null,
  role character varying(255) null default 'pelanggan'::character varying,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;



create table public.reviews (
  id uuid not null default gen_random_uuid (),
  trip_id uuid null,
  user_id uuid null,
  rating integer null,
  comment text null,
  created_at timestamp with time zone null default now(),
  constraint reviews_pkey primary key (id),
  constraint reviews_user_trip_unique unique (user_id, trip_id),
  constraint reviews_trip_id_fkey foreign KEY (trip_id) references trips (id),
  constraint reviews_user_id_fkey foreign KEY (user_id) references auth.users (id),
  constraint reviews_rating_check check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  )
) TABLESPACE pg_default;

create table public.trips (
  id uuid not null default gen_random_uuid (),
  title character varying(255) not null,
  destination_id uuid null,
  description text null,
  start_date date not null,
  end_date date not null,
  price integer not null,
  quota integer not null,
  image_url text null,
  created_at timestamp with time zone null default now(),
  constraint trips_pkey primary key (id),
  constraint trips_destination_id_fkey foreign KEY (destination_id) references destinations (id)
) TABLESPACE pg_default;

create table public.equipment_rentals (
  id uuid not null default gen_random_uuid (),
  booking_id uuid not null,
  equipment_id uuid not null,
  quantity integer not null,
  created_at timestamp with time zone not null default now(),
  constraint equipment_rentals_pkey primary key (id),
  constraint equipment_rentals_booking_id_fkey foreign KEY (booking_id) references bookings (id) on delete CASCADE,
  constraint equipment_rentals_equipment_id_fkey foreign KEY (equipment_id) references equipment (id) on delete CASCADE,
  constraint equipment_rentals_quantity_check check ((quantity > 0))
) TABLESPACE pg_default;







create table public.equipment (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  rental_price_per_day integer not null,
  stock_quantity integer not null default 0,
  image_url text null,
  created_at timestamp with time zone not null default now(),
  price_per_day numeric(10, 2) null,
  category character varying(100) null,
  updated_at timestamp with time zone null default now(),
  constraint equipment_pkey primary key (id),
  constraint equipment_rental_price_per_day_check check ((rental_price_per_day >= 0))
) TABLESPACE pg_default;

create index IF not exists idx_equipment_category on public.equipment using btree (category) TABLESPACE pg_default;

create index IF not exists idx_equipment_stock_quantity on public.equipment using btree (stock_quantity) TABLESPACE pg_default;



create table public.promotions (
  id uuid not null default gen_random_uuid (),
  code text not null,
  discount_percentage integer not null,
  max_uses integer null,
  expires_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  constraint promotions_pkey primary key (id),
  constraint promotions_code_key unique (code),
  constraint promotions_discount_percentage_check check (
    (
      (discount_percentage > 0)
      and (discount_percentage <= 100)
    )
  )
) TABLESPACE pg_default;



create table public.trips (
  id uuid not null default gen_random_uuid (),
  title character varying(255) not null,
  destination_id uuid null,
  description text null,
  start_date date not null,
  end_date date not null,
  price integer not null,
  quota integer not null,
  image_url text null,
  created_at timestamp with time zone null default now(),
  constraint trips_pkey primary key (id),
  constraint trips_destination_id_fkey foreign KEY (destination_id) references destinations (id)
) TABLESPACE pg_default;

create table public.trip_photos (
  id uuid not null default gen_random_uuid (),
  trip_id uuid not null,
  filename character varying(255) not null,
  url text not null,
  caption text null,
  uploaded_by uuid not null,
  uploaded_at timestamp with time zone not null default now(),
  constraint trip_photos_pkey primary key (id),
  constraint trip_photos_trip_id_fkey foreign KEY (trip_id) references trips (id) on delete CASCADE,
  constraint trip_photos_uploaded_by_fkey foreign KEY (uploaded_by) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_trip_photos_trip_id on public.trip_photos using btree (trip_id) TABLESPACE pg_default;

create index IF not exists idx_trip_photos_uploaded_by on public.trip_photos using btree (uploaded_by) TABLESPACE pg_default;

create table public.trip_equipment_checklist (
  id uuid not null default gen_random_uuid (),
  trip_id uuid not null,
  equipment_id uuid not null,
  is_required boolean not null default true,
  notes text null,
  created_at timestamp with time zone not null default now(),
  constraint trip_equipment_checklist_pkey primary key (id),
  constraint trip_equipment_checklist_unique unique (trip_id, equipment_id),
  constraint trip_equipment_checklist_equipment_id_fkey foreign KEY (equipment_id) references equipment (id) on delete CASCADE,
  constraint trip_equipment_checklist_trip_id_fkey foreign KEY (trip_id) references trips (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_trip_equipment_checklist_trip_id on public.trip_equipment_checklist using btree (trip_id) TABLESPACE pg_default;

create index IF not exists idx_trip_equipment_checklist_equipment_id on public.trip_equipment_checklist using btree (equipment_id) TABLESPACE pg_default;

create table public.trip_assignments (
  id uuid not null default extensions.uuid_generate_v4 (),
  trip_id uuid not null,
  tour_leader_id uuid not null,
  role character varying(50) not null default 'leader'::character varying,
  assigned_at timestamp with time zone not null default now(),
  constraint trip_assignments_pkey primary key (id),
  constraint uniq_trip_tour unique (trip_id, tour_leader_id),
  constraint fk_tour_leader foreign KEY (tour_leader_id) references profiles (id) on delete CASCADE,
  constraint fk_trip foreign KEY (trip_id) references trips (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.bookings (
  id uuid not null default gen_random_uuid (),
  trip_id uuid null,
  user_id uuid null,
  status character varying(50) null default 'pending'::character varying,
  total_participants integer not null,
  total_price integer not null,
  created_at timestamp with time zone null default now(),
  constraint bookings_pkey primary key (id),
  constraint bookings_trip_id_fkey foreign KEY (trip_id) references trips (id),
  constraint bookings_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;

create table public.vendors (
  id uuid not null default extensions.uuid_generate_v4 (),
  name character varying(255) not null,
  category character varying(100) not null,
  email character varying(255) null,
  phone character varying(50) null,
  address text null,
  contact_person character varying(255) null,
  rating integer null,
  status character varying(20) not null default 'active'::character varying,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint vendors_pkey primary key (id),
  constraint vendors_rating_check check (
    (
      (rating is null)
      or (
        (rating >= 1)
        and (rating <= 5)
      )
    )
  )
) TABLESPACE pg_default;