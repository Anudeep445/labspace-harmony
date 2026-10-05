
ALTER TABLE public.students DISABLE TRIGGER trg_students_after;
ALTER TABLE public.equipment DISABLE TRIGGER trg_equipment_after;
ALTER TABLE public.inventory DISABLE TRIGGER trg_inventory_after;
ALTER TABLE public.bookings DISABLE TRIGGER trg_bookings_after;
ALTER TABLE public.maintenance_requests DISABLE TRIGGER trg_maintenance_after;

-- Faculty (20). FAC001 is the demo faculty account.
INSERT INTO public.faculty (code, name, department, email, phone, specialization) VALUES
('FAC001','Dr. Priya Raman','Computer Science','faculty@college.edu','+91 98400 11201','Computer Networks'),
('FAC002','Prof. Arjun Mehta','Computer Science','arjun.mehta@college.edu','+91 98400 11202','Operating Systems'),
('FAC003','Dr. Kavitha Nair','Computer Science','kavitha.nair@college.edu','+91 98400 11203','Database Systems'),
('FAC004','Dr. Rahul Verma','Data Science','rahul.verma@college.edu','+91 98400 11204','Machine Learning'),
('FAC005','Prof. Sneha Iyer','Electronics','sneha.iyer@college.edu','+91 98400 11205','Embedded Systems / IoT'),
('FAC006','Dr. Vikram Singh','Electronics','vikram.singh@college.edu','+91 98400 11206','Analog Electronics'),
('FAC007','Prof. Ananya Das','Information Technology','ananya.das@college.edu','+91 98400 11207','Web Technologies'),
('FAC008','Dr. Suresh Kumar','Computer Science','suresh.kumar@college.edu','+91 98400 11208','Compiler Design'),
('FAC009','Prof. Meera Pillai','Data Science','meera.pillai@college.edu','+91 98400 11209','Big Data Analytics'),
('FAC010','Dr. Karthik Reddy','Information Technology','karthik.reddy@college.edu','+91 98400 11210','Cloud Computing'),
('FAC011','Prof. Divya Sharma','Electronics','divya.sharma@college.edu','+91 98400 11211','VLSI Design'),
('FAC012','Dr. Manoj Patil','Computer Science','manoj.patil@college.edu','+91 98400 11212','Cyber Security'),
('FAC013','Prof. Lakshmi Menon','Information Technology','lakshmi.menon@college.edu','+91 98400 11213','Software Engineering'),
('FAC014','Dr. Nikhil Joshi','Data Science','nikhil.joshi@college.edu','+91 98400 11214','Deep Learning'),
('FAC015','Prof. Pooja Gupta','Computer Science','pooja.gupta@college.edu','+91 98400 11215','Data Structures'),
('FAC016','Dr. Ravi Shankar','Electronics','ravi.shankar@college.edu','+91 98400 11216','Digital Signal Processing'),
('FAC017','Prof. Swathi Rao','Information Technology','swathi.rao@college.edu','+91 98400 11217','Mobile Computing'),
('FAC018','Dr. Ajay Kulkarni','Computer Science','ajay.kulkarni@college.edu','+91 98400 11218','Distributed Systems'),
('FAC019','Prof. Nandini Bose','Data Science','nandini.bose@college.edu','+91 98400 11219','Statistics'),
('FAC020','Dr. Harish Chandra','Electronics','harish.chandra@college.edu','+91 98400 11220','Microprocessors');

INSERT INTO public.labs (code, name, department, building, floor, room, capacity, lab_type, status, faculty_id) VALUES
('LAB-CN01','Computer Networks Lab','Computer Science','Block A','2nd Floor','A-204',40,'Computing','Available',(SELECT id FROM faculty WHERE code='FAC001')),
('LAB-OS02','Operating Systems Lab','Computer Science','Block A','2nd Floor','A-206',40,'Computing','Available',(SELECT id FROM faculty WHERE code='FAC002')),
('LAB-DB03','Database Lab','Computer Science','Block A','3rd Floor','A-301',36,'Computing','Occupied',(SELECT id FROM faculty WHERE code='FAC003')),
('LAB-DS04','Data Science Lab','Data Science','Block B','1st Floor','B-105',30,'Research','Available',(SELECT id FROM faculty WHERE code='FAC004')),
('LAB-IOT05','IoT Lab','Electronics','Block C','Ground Floor','C-012',24,'Hardware','Available',(SELECT id FROM faculty WHERE code='FAC005')),
('LAB-EL06','Electronics Lab','Electronics','Block C','1st Floor','C-110',32,'Hardware','Maintenance',(SELECT id FROM faculty WHERE code='FAC006'));

UPDATE public.faculty f SET assigned_lab_id = l.id FROM public.labs l, (VALUES
 ('FAC001','LAB-CN01'),('FAC002','LAB-OS02'),('FAC003','LAB-DB03'),('FAC004','LAB-DS04'),('FAC005','LAB-IOT05'),('FAC006','LAB-EL06'),
 ('FAC007','LAB-CN01'),('FAC008','LAB-OS02'),('FAC009','LAB-DS04'),('FAC010','LAB-CN01'),('FAC011','LAB-EL06'),('FAC012','LAB-CN01'),
 ('FAC013','LAB-DB03'),('FAC014','LAB-DS04'),('FAC015','LAB-OS02'),('FAC016','LAB-EL06'),('FAC017','LAB-IOT05'),('FAC018','LAB-OS02'),
 ('FAC019','LAB-DS04'),('FAC020','LAB-IOT05')) AS m(fc, lc) WHERE f.code = m.fc AND l.code = m.lc;

-- Students (300): 5 departments x years 2-3 x sections A/B, 30 each
WITH fn AS (SELECT ARRAY['Aarav','Aditi','Akash','Ananya','Arjun','Bhavya','Chetan','Deepa','Dev','Divya','Gaurav','Harini','Ishaan','Jaya','Karan','Kavya','Lakshman','Lavanya','Manish','Meera','Naveen','Neha','Pranav','Priya','Rohit','Riya','Sahil','Sanjana','Tarun','Varsha','Vishal','Yamini'] a),
ln AS (SELECT ARRAY['Sharma','Reddy','Nair','Iyer','Patel','Gupta','Kumar','Rao','Singh','Menon','Das','Joshi','Pillai','Verma','Bose','Kulkarni'] a),
g AS (SELECT n, (ARRAY['CSE','CSE','IT','DS','ECE'])[((n-1)/60)+1] AS dept, 2 + ((n-1)/30) % 2 AS yr, (ARRAY['A','B'])[((n-1)/15)%2+1] AS sec FROM generate_series(1,300) n)
INSERT INTO public.students (code, name, roll_no, department, year, section, email, lab_id)
SELECT 'STU' || lpad(n::text,4,'0'),
  CASE WHEN n=1 THEN 'Rohan Kapoor' ELSE fn.a[((n*7) % 32)+1] || ' ' || ln.a[((n*3) % 16)+1] END,
  '22' || dept || lpad(n::text,3,'0'),
  CASE dept WHEN 'CSE' THEN 'Computer Science' WHEN 'IT' THEN 'Information Technology' WHEN 'DS' THEN 'Data Science' ELSE 'Electronics' END,
  yr, sec,
  CASE WHEN n=1 THEN 'student@college.edu' ELSE 'stu' || lpad(n::text,4,'0') || '@college.edu' END,
  (SELECT id FROM labs WHERE code = CASE dept WHEN 'CSE' THEN (CASE WHEN n % 2 = 0 THEN 'LAB-OS02' ELSE 'LAB-CN01' END) WHEN 'IT' THEN 'LAB-DB03' WHEN 'DS' THEN 'LAB-DS04' ELSE (CASE WHEN n%2=0 THEN 'LAB-EL06' ELSE 'LAB-IOT05' END) END)
FROM g, fn, ln;

-- Equipment (150): 25 per lab
WITH labs_o AS (SELECT id, code, row_number() OVER (ORDER BY code) AS li FROM labs),
items AS (SELECT * FROM (VALUES
 ('LAB-CN01','Desktop Workstation','Computer','Dell','OptiPlex 7090'),('LAB-CN01','Cisco Router','Networking','Cisco','ISR 4331'),('LAB-CN01','Managed Switch','Networking','Cisco','Catalyst 2960'),('LAB-CN01','Network Analyzer','Testing','Fluke','LinkIQ'),('LAB-CN01','Projector','AV','Epson','EB-X51'),
 ('LAB-DB03','Desktop Workstation','Computer','HP','EliteDesk 800'),('LAB-DB03','Database Server','Server','Dell','PowerEdge R450'),('LAB-DB03','UPS Unit','Power','APC','Smart-UPS 3000'),('LAB-DB03','Projector','AV','BenQ','MX560'),('LAB-DB03','Network Switch','Networking','TP-Link','TL-SG1024'),
 ('LAB-DS04','GPU Workstation','Computer','Lenovo','ThinkStation P620'),('LAB-DS04','NVIDIA GPU Card','Computer','NVIDIA','RTX A5000'),('LAB-DS04','Interactive Display','AV','Samsung','Flip Pro 75'),('LAB-DS04','NAS Storage','Server','Synology','DS1621+'),('LAB-DS04','Laptop','Computer','Apple','MacBook Pro 14'),
 ('LAB-EL06','Digital Oscilloscope','Testing','Tektronix','TBS1102C'),('LAB-EL06','Function Generator','Testing','Keysight','33210A'),('LAB-EL06','DC Power Supply','Power','Rigol','DP832'),('LAB-EL06','Digital Multimeter','Testing','Fluke','117'),('LAB-EL06','Soldering Station','Tools','Weller','WE1010'),
 ('LAB-IOT05','Arduino Kit','Microcontroller','Arduino','Uno R3 Kit'),('LAB-IOT05','Raspberry Pi Kit','Microcontroller','Raspberry Pi','Pi 4 Model B'),('LAB-IOT05','ESP32 Dev Board','Microcontroller','Espressif','DevKitC'),('LAB-IOT05','3D Printer','Fabrication','Creality','Ender 3 V3'),('LAB-IOT05','Logic Analyzer','Testing','Saleae','Logic 8'),
 ('LAB-OS02','Desktop Workstation','Computer','Lenovo','ThinkCentre M70'),('LAB-OS02','Linux Server','Server','HP','ProLiant DL380'),('LAB-OS02','KVM Switch','Networking','ATEN','CS1708'),('LAB-OS02','Projector','AV','Epson','EB-E01'),('LAB-OS02','UPS Unit','Power','APC','Back-UPS 1500')
) v(lc,name,cat,brand,model)),
gen AS (SELECT l.id lab_id, l.code lc, l.li, i.name, i.cat, i.brand, i.model, k, row_number() OVER (ORDER BY l.code, i.name, k) rn
  FROM labs_o l JOIN items i ON i.lc = l.code CROSS JOIN generate_series(1,5) k)
INSERT INTO public.equipment (code, name, category, lab_id, brand, model, serial_no, purchase_date, warranty_expiry, quantity, condition, status)
SELECT 'EQ-' || lpad(rn::text,4,'0'), name || ' #' || k, cat, lab_id, brand, model,
  upper(left(brand,3)) || '-' || (100000 + rn*7919 % 899999)::text,
  date '2021-06-01' + ((rn*37) % 1200)::int,
  date '2021-06-01' + ((rn*37) % 1200)::int + interval '3 years',
  CASE WHEN cat IN ('Microcontroller','Testing') THEN 2 + (rn % 4) ELSE 1 END,
  CASE WHEN rn % 23 = 0 THEN 'Damaged' WHEN rn % 9 = 0 THEN 'Fair' WHEN rn % 4 = 0 THEN 'Excellent' ELSE 'Good' END,
  CASE WHEN rn % 23 = 0 THEN 'Damaged' WHEN rn % 17 = 0 THEN 'Under Maintenance' WHEN rn % 7 = 0 THEN 'In Use' WHEN rn = 149 THEN 'Lost' ELSE 'Available' END
FROM gen;

-- Inventory (20)
INSERT INTO public.inventory (code, name, category, lab_id, quantity, min_stock, supplier) VALUES
('INV-001','HDMI Cables (2m)','Cables',(SELECT id FROM labs WHERE code='LAB-CN01'),45,15,'TechSupply Co.'),
('INV-002','Ethernet Cables Cat6','Cables',(SELECT id FROM labs WHERE code='LAB-CN01'),12,20,'NetWorks India'),
('INV-003','RJ45 Connectors (box)','Connectors',(SELECT id FROM labs WHERE code='LAB-CN01'),8,5,'NetWorks India'),
('INV-004','Breadboards (830 pt)','Prototyping',(SELECT id FROM labs WHERE code='LAB-EL06'),60,20,'Robu Electronics'),
('INV-005','Resistor Kit (1/4W)','Components',(SELECT id FROM labs WHERE code='LAB-EL06'),25,10,'Robu Electronics'),
('INV-006','Capacitor Assortment','Components',(SELECT id FROM labs WHERE code='LAB-EL06'),4,10,'Robu Electronics'),
('INV-007','IC 555 Timer','ICs',(SELECT id FROM labs WHERE code='LAB-EL06'),0,25,'Element14'),
('INV-008','IC 741 Op-Amp','ICs',(SELECT id FROM labs WHERE code='LAB-EL06'),80,25,'Element14'),
('INV-009','Arduino Uno Boards','Boards',(SELECT id FROM labs WHERE code='LAB-IOT05'),18,10,'Arduino Store India'),
('INV-010','Raspberry Pi 4 Boards','Boards',(SELECT id FROM labs WHERE code='LAB-IOT05'),6,8,'Element14'),
('INV-011','DHT22 Temp Sensors','Sensors',(SELECT id FROM labs WHERE code='LAB-IOT05'),35,15,'Robu Electronics'),
('INV-012','Ultrasonic Sensors HC-SR04','Sensors',(SELECT id FROM labs WHERE code='LAB-IOT05'),0,10,'Robu Electronics'),
('INV-013','Jumper Wires (pack)','Connectors',(SELECT id FROM labs WHERE code='LAB-IOT05'),50,20,'Robu Electronics'),
('INV-014','AA Batteries','Batteries',(SELECT id FROM labs WHERE code='LAB-IOT05'),40,30,'Duracell Distributor'),
('INV-015','9V Batteries','Batteries',(SELECT id FROM labs WHERE code='LAB-EL06'),9,12,'Duracell Distributor'),
('INV-016','USB Keyboards','Peripherals',(SELECT id FROM labs WHERE code='LAB-OS02'),22,8,'Dell Partner Store'),
('INV-017','USB Mice','Peripherals',(SELECT id FROM labs WHERE code='LAB-DB03'),30,10,'Dell Partner Store'),
('INV-018','USB Flash Drives 32GB','Storage',(SELECT id FROM labs WHERE code='LAB-DS04'),14,10,'SanDisk Distributor'),
('INV-019','Thermal Paste','Consumables',(SELECT id FROM labs WHERE code='LAB-DS04'),3,5,'TechSupply Co.'),
('INV-020','Solder Wire Rolls','Consumables',(SELECT id FROM labs WHERE code='LAB-EL06'),11,6,'Weller India');

-- Bookings (20+) relative to today
INSERT INTO public.bookings (lab_id, faculty_id, booking_date, start_time, end_time, subject, class_batch, purpose, status) VALUES
((SELECT id FROM labs WHERE code='LAB-CN01'),(SELECT id FROM faculty WHERE code='FAC001'),current_date,'10:00','12:00','Computer Networks','CSE-3A','Socket programming practical','Approved'),
((SELECT id FROM labs WHERE code='LAB-OS02'),(SELECT id FROM faculty WHERE code='FAC002'),current_date,'09:00','11:00','Operating Systems','CSE-2B','Process scheduling simulation','Approved'),
((SELECT id FROM labs WHERE code='LAB-DB03'),(SELECT id FROM faculty WHERE code='FAC003'),current_date,'14:00','16:00','DBMS','IT-3A','SQL joins and indexing','Approved'),
((SELECT id FROM labs WHERE code='LAB-DS04'),(SELECT id FROM faculty WHERE code='FAC004'),current_date + 1,'11:00','13:00','Machine Learning','DS-3A','Regression models with scikit-learn','Approved'),
((SELECT id FROM labs WHERE code='LAB-CN01'),(SELECT id FROM faculty WHERE code='FAC001'),current_date + 2,'14:00','16:00','Computer Networks','CSE-3B','Routing protocols with Packet Tracer','Approved'),
((SELECT id FROM labs WHERE code='LAB-IOT05'),(SELECT id FROM faculty WHERE code='FAC005'),current_date + 1,'09:00','11:00','IoT Systems','ECE-3A','Sensor interfacing with Arduino','Approved'),
((SELECT id FROM labs WHERE code='LAB-OS02'),(SELECT id FROM faculty WHERE code='FAC008'),current_date + 3,'10:00','12:00','Compiler Design','CSE-3A','Lexer implementation','Approved'),
((SELECT id FROM labs WHERE code='LAB-DB03'),(SELECT id FROM faculty WHERE code='FAC013'),current_date + 2,'09:00','11:00','Software Engineering','IT-2A','UML modelling session','Approved'),
((SELECT id FROM labs WHERE code='LAB-DS04'),(SELECT id FROM faculty WHERE code='FAC009'),current_date + 4,'14:00','17:00','Big Data Analytics','DS-2B','Spark data pipelines','Approved'),
((SELECT id FROM labs WHERE code='LAB-CN01'),(SELECT id FROM faculty WHERE code='FAC012'),current_date + 4,'10:00','12:00','Cyber Security','CSE-2A','Wireshark packet analysis','Approved'),
((SELECT id FROM labs WHERE code='LAB-CN01'),(SELECT id FROM faculty WHERE code='FAC001'),current_date + 3,'14:00','16:00','Computer Networks','CSE-3A','Subnetting exercise','Pending'),
((SELECT id FROM labs WHERE code='LAB-DS04'),(SELECT id FROM faculty WHERE code='FAC014'),current_date + 5,'10:00','12:00','Deep Learning','DS-3B','CNN training lab','Pending'),
((SELECT id FROM labs WHERE code='LAB-IOT05'),(SELECT id FROM faculty WHERE code='FAC017'),current_date + 2,'11:00','13:00','Mobile Computing','IT-3B','BLE beacons demo','Pending'),
((SELECT id FROM labs WHERE code='LAB-OS02'),(SELECT id FROM faculty WHERE code='FAC015'),current_date + 5,'14:00','16:00','Data Structures','CSE-2A','Linked list implementation','Pending'),
((SELECT id FROM labs WHERE code='LAB-DB03'),(SELECT id FROM faculty WHERE code='FAC007'),current_date + 1,'15:00','17:00','Web Technologies','IT-2B','REST API with Node.js','Rejected'),
((SELECT id FROM labs WHERE code='LAB-CN01'),(SELECT id FROM faculty WHERE code='FAC010'),current_date + 6,'09:00','10:00','Cloud Computing','IT-3A','VM provisioning','Cancelled'),
((SELECT id FROM labs WHERE code='LAB-CN01'),(SELECT id FROM faculty WHERE code='FAC001'),current_date - 7,'10:00','12:00','Computer Networks','CSE-3A','TCP/IP configuration','Completed'),
((SELECT id FROM labs WHERE code='LAB-CN01'),(SELECT id FROM faculty WHERE code='FAC001'),current_date - 14,'10:00','12:00','Computer Networks','CSE-3A','Network topology design','Completed'),
((SELECT id FROM labs WHERE code='LAB-CN01'),(SELECT id FROM faculty WHERE code='FAC001'),current_date - 21,'10:00','12:00','Computer Networks','CSE-3A','Cabling and crimping','Completed'),
((SELECT id FROM labs WHERE code='LAB-OS02'),(SELECT id FROM faculty WHERE code='FAC002'),current_date - 6,'09:00','11:00','Operating Systems','CSE-2B','Shell scripting','Completed'),
((SELECT id FROM labs WHERE code='LAB-DS04'),(SELECT id FROM faculty WHERE code='FAC004'),current_date - 10,'11:00','13:00','Machine Learning','DS-3A','Data preprocessing','Completed'),
((SELECT id FROM labs WHERE code='LAB-DB03'),(SELECT id FROM faculty WHERE code='FAC003'),current_date - 30,'14:00','16:00','DBMS','IT-3A','ER diagrams','Completed'),
((SELECT id FROM labs WHERE code='LAB-IOT05'),(SELECT id FROM faculty WHERE code='FAC005'),current_date - 45,'09:00','11:00','IoT Systems','ECE-3A','GPIO basics','Completed'),
((SELECT id FROM labs WHERE code='LAB-CN01'),(SELECT id FROM faculty WHERE code='FAC001'),current_date - 60,'10:00','12:00','Computer Networks','CSE-3A','OSI model walkthrough','Completed');

-- Attendance for completed sessions, for students whose batch matches
INSERT INTO public.attendance (student_id, faculty_id, lab_id, subject, class_batch, att_date, status)
SELECT s.id, b.faculty_id, b.lab_id, b.subject, b.class_batch, b.booking_date,
  CASE WHEN s.code = 'STU0001' AND b.booking_date = current_date - 14 THEN 'Absent'
       WHEN (abs(hashtext(s.id::text || b.id::text)) % 100) < 14 THEN 'Absent' ELSE 'Present' END
FROM public.bookings b JOIN public.students s
  ON (CASE s.department WHEN 'Computer Science' THEN 'CSE' WHEN 'Information Technology' THEN 'IT' WHEN 'Data Science' THEN 'DS' ELSE 'ECE' END) || '-' || s.year || s.section = b.class_batch
WHERE b.status = 'Completed';

-- Maintenance (10)
INSERT INTO public.maintenance_requests (equipment_id, lab_id, reporter_name, issue_type, description, priority, status, technician, resolution, created_at) 
SELECT e.id, e.lab_id, v.rep, v.it, v.descr, v.pr, v.st, v.tech, v.res, now() - (v.days || ' days')::interval
FROM (VALUES
 ('EQ-0017','Dr. Priya Raman','Hardware Fault','Router not booting, power LED blinking amber','High','In Progress','Ramesh (IT Support)',NULL,2),
 ('EQ-0034','Dr. Kavitha Nair','Software Issue','Database server failing nightly backups','Critical','Assigned','Sunil (Systems)',NULL,1),
 ('EQ-0051','Rohan Kapoor','Physical Damage','GPU workstation fan making grinding noise','Medium','Open',NULL,NULL,0),
 ('EQ-0068','Prof. Sneha Iyer','Hardware Fault','Oscilloscope channel 2 shows no signal','High','In Progress','Venkat (Electronics)',NULL,5),
 ('EQ-0085','Dr. Vikram Singh','Calibration','Power supply output voltage drifting','Medium','Resolved','Venkat (Electronics)','Recalibrated and replaced output regulator',20),
 ('EQ-0102','Aditi Sharma','Physical Damage','Arduino kit USB port broken','Low','Closed','Ramesh (IT Support)','Board replaced from spares',35),
 ('EQ-0119','Prof. Arjun Mehta','Hardware Fault','Workstation RAM errors during boot','Medium','Resolved','Ramesh (IT Support)','Replaced 8GB DIMM',50),
 ('EQ-0136','Prof. Arjun Mehta','Software Issue','Linux server kernel panic after update','High','Resolved','Sunil (Systems)','Rolled back kernel and patched',70),
 ('EQ-0005','Karan Reddy','Physical Damage','Projector lamp flickering','Low','Open',NULL,NULL,3),
 ('EQ-0040','Dr. Kavitha Nair','Power Issue','UPS battery not holding charge','High','Assigned','Sunil (Systems)',NULL,8)
) v(ec, rep, it, descr, pr, st, tech, res, days) JOIN public.equipment e ON e.code = v.ec;
UPDATE public.equipment SET status='Under Maintenance' WHERE code IN ('EQ-0017','EQ-0034','EQ-0068','EQ-0040');

INSERT INTO public.activity_log (action, details, kind, created_at) VALUES
('New equipment added','EQ-0150 — Desktop Workstation #5 (Operating Systems Lab)','equipment', now() - interval '3 hours'),
('Booking approved','Computer Networks Lab — Computer Networks (Dr. Priya Raman)','booking', now() - interval '5 hours'),
('Maintenance request submitted','MR-1003 — GPU Workstation by Rohan Kapoor','maintenance', now() - interval '8 hours'),
('Equipment marked damaged','EQ-0046 — Digital Multimeter #1','equipment', now() - interval '1 day'),
('New student registered','Rohan Kapoor (22CSE001)','student', now() - interval '2 days');

ALTER TABLE public.students ENABLE TRIGGER trg_students_after;
ALTER TABLE public.equipment ENABLE TRIGGER trg_equipment_after;
ALTER TABLE public.inventory ENABLE TRIGGER trg_inventory_after;
ALTER TABLE public.bookings ENABLE TRIGGER trg_bookings_after;
ALTER TABLE public.maintenance_requests ENABLE TRIGGER trg_maintenance_after;

CREATE POLICY "issue images read auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'issue-images');
