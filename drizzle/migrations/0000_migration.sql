
CREATE TYPE public.app_role AS ENUM ('admin','faculty','student');

CREATE TABLE public.profiles (id uuid PRIMARY KEY, name text NOT NULL, email text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, role public.app_role NOT NULL, UNIQUE(user_id, role));

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE TABLE public.faculty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, user_id uuid UNIQUE,
  name text NOT NULL, department text NOT NULL, email text UNIQUE NOT NULL, phone text, specialization text,
  assigned_lab_id uuid, created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE public.labs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, name text NOT NULL, department text NOT NULL,
  building text NOT NULL, floor text NOT NULL, room text NOT NULL, capacity int NOT NULL DEFAULT 30, lab_type text NOT NULL,
  status text NOT NULL DEFAULT 'Available', faculty_id uuid REFERENCES public.faculty(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.faculty ADD CONSTRAINT faculty_lab_fk FOREIGN KEY (assigned_lab_id) REFERENCES public.labs(id) ON DELETE SET NULL;

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, user_id uuid UNIQUE, name text NOT NULL,
  roll_no text UNIQUE NOT NULL, department text NOT NULL, year int NOT NULL, section text NOT NULL, email text UNIQUE NOT NULL,
  lab_id uuid REFERENCES public.labs(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, name text NOT NULL, category text NOT NULL,
  lab_id uuid REFERENCES public.labs(id) ON DELETE SET NULL, brand text, model text, serial_no text, purchase_date date,
  warranty_expiry date, quantity int NOT NULL DEFAULT 1, condition text NOT NULL DEFAULT 'Good', status text NOT NULL DEFAULT 'Available',
  created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lab_id uuid NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  faculty_id uuid NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE, booking_date date NOT NULL, start_time time NOT NULL,
  end_time time NOT NULL, subject text NOT NULL, class_batch text NOT NULL, purpose text, status text NOT NULL DEFAULT 'Pending',
  admin_note text, created_by uuid, created_at timestamptz NOT NULL DEFAULT now());

CREATE SEQUENCE public.mr_seq START 1001;
CREATE TABLE public.maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL DEFAULT ('MR-' || nextval('public.mr_seq')),
  equipment_id uuid REFERENCES public.equipment(id) ON DELETE CASCADE, lab_id uuid REFERENCES public.labs(id) ON DELETE SET NULL,
  reported_by uuid, reporter_name text NOT NULL, issue_type text NOT NULL DEFAULT 'Hardware Fault', description text NOT NULL,
  priority text NOT NULL DEFAULT 'Medium', status text NOT NULL DEFAULT 'Open', technician text, resolution text, image_url text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, name text NOT NULL, category text NOT NULL,
  lab_id uuid REFERENCES public.labs(id) ON DELETE SET NULL, quantity int NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock int NOT NULL DEFAULT 5, supplier text, updated_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  faculty_id uuid REFERENCES public.faculty(id) ON DELETE SET NULL, lab_id uuid NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  subject text NOT NULL, class_batch text NOT NULL, att_date date NOT NULL, status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(student_id, lab_id, subject, att_date));

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, title text NOT NULL, message text NOT NULL,
  type text NOT NULL DEFAULT 'info', is_read boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), action text NOT NULL, details text, kind text NOT NULL DEFAULT 'info',
  created_at timestamptz NOT NULL DEFAULT now());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.user_roles, public.faculty, public.labs, public.students, public.equipment,
  public.bookings, public.maintenance_requests, public.inventory, public.attendance, public.notifications, public.activity_log TO authenticated;
GRANT ALL ON public.profiles, public.user_roles, public.faculty, public.labs, public.students, public.equipment,
  public.bookings, public.maintenance_requests, public.inventory, public.attendance, public.notifications, public.activity_log TO service_role;
GRANT USAGE ON SEQUENCE public.mr_seq TO authenticated, service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.my_faculty_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT id FROM public.faculty WHERE user_id = auth.uid() $$;
CREATE OR REPLACE FUNCTION public.my_student_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT id FROM public.students WHERE user_id = auth.uid() $$;

CREATE POLICY "own profile or admin" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "read labs" ON public.labs FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin labs" ON public.labs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "read faculty" ON public.faculty FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin faculty" ON public.faculty FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "read equipment" ON public.equipment FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin equipment" ON public.equipment FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "read inventory" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin inventory" ON public.inventory FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "staff read students" ON public.students FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'faculty') OR user_id = auth.uid());
CREATE POLICY "admin students" ON public.students FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "read bookings" ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "faculty create booking" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(),'faculty') AND faculty_id = public.my_faculty_id() AND status = 'Pending') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "faculty cancel own" ON public.bookings FOR UPDATE TO authenticated USING (faculty_id = public.my_faculty_id()) WITH CHECK (faculty_id = public.my_faculty_id() AND status IN ('Pending','Cancelled'));
CREATE POLICY "admin delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "read maintenance" ON public.maintenance_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "report issue" ON public.maintenance_requests FOR INSERT TO authenticated WITH CHECK (reported_by = auth.uid());
CREATE POLICY "admin maintenance" ON public.maintenance_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete maintenance" ON public.maintenance_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "read attendance" ON public.attendance FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'faculty') OR student_id = public.my_student_id());
CREATE POLICY "staff write attendance" ON public.attendance FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'faculty'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'faculty'));

CREATE POLICY "own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "admin read activity" ON public.activity_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.notify_admins(_title text, _msg text, _type text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications(user_id,title,message,type) SELECT user_id,_title,_msg,_type FROM public.user_roles WHERE role='admin' $$;
CREATE OR REPLACE FUNCTION public.log_activity(_action text, _details text, _kind text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$ INSERT INTO public.activity_log(action,details,kind) VALUES (_action,_details,_kind) $$;

CREATE OR REPLACE FUNCTION public.bookings_validate() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE clash record; lab_status text;
BEGIN
  IF NEW.end_time <= NEW.start_time THEN RAISE EXCEPTION 'End time must be after start time'; END IF;
  IF NEW.status IN ('Pending','Approved') THEN
    SELECT status INTO lab_status FROM labs WHERE id = NEW.lab_id;
    IF TG_OP = 'INSERT' AND lab_status IN ('Maintenance','Inactive') THEN
      RAISE EXCEPTION 'This laboratory is currently % and cannot be booked', lab_status; END IF;
    SELECT b.id, b.status, b.start_time, b.end_time, b.subject INTO clash FROM bookings b
      WHERE b.lab_id = NEW.lab_id AND b.booking_date = NEW.booking_date AND b.id <> NEW.id
        AND b.start_time < NEW.end_time AND NEW.start_time < b.end_time
        AND ((TG_OP = 'INSERT' AND b.status IN ('Approved','Pending')) OR (NEW.status = 'Approved' AND b.status = 'Approved'))
      LIMIT 1;
    IF FOUND THEN
      RAISE EXCEPTION 'Booking conflict: lab already % from % to % (%)', lower(clash.status), to_char(clash.start_time,'HH24:MI'), to_char(clash.end_time,'HH24:MI'), clash.subject;
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_bookings_validate BEFORE INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.bookings_validate();

CREATE OR REPLACE FUNCTION public.bookings_after() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE lab_name text; fac record;
BEGIN
  SELECT name INTO lab_name FROM labs WHERE id = NEW.lab_id;
  SELECT * INTO fac FROM faculty WHERE id = NEW.faculty_id;
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'Pending' THEN
      PERFORM notify_admins('New booking request', fac.name || ' requested ' || lab_name || ' on ' || to_char(NEW.booking_date,'DD Mon') || ' ' || to_char(NEW.start_time,'HH24:MI') || '-' || to_char(NEW.end_time,'HH24:MI'), 'booking');
    END IF;
    PERFORM log_activity('Booking requested', fac.name || ' → ' || lab_name || ' (' || NEW.subject || ')', 'booking');
  ELSIF NEW.status <> OLD.status THEN
    IF fac.user_id IS NOT NULL AND NEW.status IN ('Approved','Rejected') THEN
      INSERT INTO notifications(user_id,title,message,type) VALUES (fac.user_id, 'Booking ' || lower(NEW.status),
        lab_name || ' on ' || to_char(NEW.booking_date,'DD Mon YYYY') || ' ' || to_char(NEW.start_time,'HH24:MI') || '-' || to_char(NEW.end_time,'HH24:MI') || ' was ' || lower(NEW.status) || coalesce(': ' || NEW.admin_note,''),
        CASE WHEN NEW.status='Approved' THEN 'success' ELSE 'error' END);
    END IF;
    PERFORM log_activity('Booking ' || lower(NEW.status), lab_name || ' — ' || NEW.subject || ' (' || fac.name || ')', 'booking');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_bookings_after AFTER INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.bookings_after();

CREATE OR REPLACE FUNCTION public.maintenance_after() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE eq_name text;
BEGIN
  SELECT name INTO eq_name FROM equipment WHERE id = NEW.equipment_id;
  IF TG_OP = 'INSERT' THEN
    IF NEW.priority IN ('High','Critical') THEN
      UPDATE equipment SET status = 'Under Maintenance' WHERE id = NEW.equipment_id;
    END IF;
    PERFORM notify_admins('Maintenance request ' || NEW.code, coalesce(eq_name,'Equipment') || ': ' || left(NEW.description,80) || ' [' || NEW.priority || ']', 'maintenance');
    PERFORM log_activity('Maintenance request submitted', NEW.code || ' — ' || coalesce(eq_name,'') || ' by ' || NEW.reporter_name, 'maintenance');
  ELSIF NEW.status <> OLD.status THEN
    IF NEW.status IN ('Assigned','In Progress') THEN
      UPDATE equipment SET status = 'Under Maintenance' WHERE id = NEW.equipment_id;
    ELSIF NEW.status IN ('Resolved','Closed') THEN
      UPDATE equipment SET status = 'Available', condition = CASE WHEN condition IN ('Damaged','Poor') THEN 'Good' ELSE condition END WHERE id = NEW.equipment_id
        AND NOT EXISTS (SELECT 1 FROM maintenance_requests m WHERE m.equipment_id = NEW.equipment_id AND m.id <> NEW.id AND m.status IN ('Open','Assigned','In Progress') AND m.priority IN ('High','Critical'));
    END IF;
    IF NEW.reported_by IS NOT NULL THEN
      INSERT INTO notifications(user_id,title,message,type) VALUES (NEW.reported_by, 'Maintenance ' || NEW.code || ' updated',
        coalesce(eq_name,'Equipment') || ' is now ' || NEW.status || coalesce('. ' || NEW.resolution,''), 'maintenance');
    END IF;
    PERFORM log_activity('Maintenance ' || lower(NEW.status), NEW.code || ' — ' || coalesce(eq_name,''), 'maintenance');
  END IF;
  RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.touch_updated() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER trg_mr_touch BEFORE UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated();
CREATE TRIGGER trg_inv_touch BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.touch_updated();
CREATE TRIGGER trg_maintenance_after AFTER INSERT OR UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.maintenance_after();

CREATE OR REPLACE FUNCTION public.equipment_after() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM log_activity('New equipment added', NEW.code || ' — ' || NEW.name, 'equipment');
  ELSIF NEW.status <> OLD.status AND NEW.status IN ('Damaged','Lost') THEN
    PERFORM log_activity('Equipment marked ' || lower(NEW.status), NEW.code || ' — ' || NEW.name, 'equipment');
    PERFORM notify_admins('Equipment unavailable', NEW.name || ' (' || NEW.code || ') marked ' || NEW.status, 'equipment');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_equipment_after AFTER INSERT OR UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.equipment_after();

CREATE OR REPLACE FUNCTION public.inventory_after() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.quantity <= NEW.min_stock AND (TG_OP = 'INSERT' OR OLD.quantity > OLD.min_stock OR (NEW.quantity = 0 AND OLD.quantity > 0)) THEN
    PERFORM notify_admins(CASE WHEN NEW.quantity = 0 THEN 'Out of stock' ELSE 'Low inventory' END, NEW.name || ' — ' || NEW.quantity || ' left (min ' || NEW.min_stock || ')', 'inventory');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_inventory_after AFTER INSERT OR UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.inventory_after();

CREATE OR REPLACE FUNCTION public.students_after() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM log_activity('New student registered', NEW.name || ' (' || NEW.roll_no || ')', 'student'); RETURN NEW; END $$;
CREATE TRIGGER trg_students_after AFTER INSERT ON public.students FOR EACH ROW EXECUTE FUNCTION public.students_after();

CREATE INDEX ON public.bookings(lab_id, booking_date);
CREATE INDEX ON public.attendance(student_id);
CREATE INDEX ON public.notifications(user_id, is_read);
CREATE INDEX ON public.equipment(lab_id);

CREATE POLICY "issue images read" ON storage.objects FOR SELECT USING (bucket_id = 'issue-images');
CREATE POLICY "issue images upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'issue-images');
