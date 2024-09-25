-- -- create tables for students, each table for each class

-- -- class I
-- CREATE TABLE student_class_1(
-- 	student_id text PRIMARY KEY,
-- 	DOB DATE,
-- 	firstname text,
-- 	middle_lastname text,
-- 	fathername text,
-- 	mothername text,
-- 	address text,
-- 	email text,
-- 	tel_num text,
-- 	login_key text
-- );

-- -- class II
-- CREATE TABLE student_class_2(
-- 	student_id text PRIMARY KEY,
-- 	DOB DATE,
-- 	firstname text,
-- 	middle_lastname text,
-- 	fathername text,
-- 	mothername text,
-- 	address text,
-- 	email text,
-- 	tel_num text,
-- 	login_key text
-- );

-- -- class III
-- CREATE TABLE student_class_3(
-- 	student_id text PRIMARY KEY,
-- 	DOB DATE,
-- 	firstname text,
-- 	middle_lastname text,
-- 	fathername text,
-- 	mothername text,
-- 	address text,
-- 	email text,
-- 	tel_num text,
-- 	login_key text
-- );

-- -- class IV
-- CREATE TABLE student_class_4(
-- 	student_id text PRIMARY KEY,
-- 	DOB DATE,
-- 	firstname text,
-- 	middle_lastname text,
-- 	fathername text,
-- 	mothername text,
-- 	address text,
-- 	email text,
-- 	tel_num text,
-- 	login_key text
-- );

-- -- class V
-- CREATE TABLE student_class_5(
-- 	student_id text PRIMARY KEY,
-- 	DOB DATE,
-- 	firstname text,
-- 	middle_lastname text,
-- 	fathername text,
-- 	mothername text,
-- 	address text,
-- 	email text,
-- 	tel_num text,
-- 	login_key text
-- );

-- -- class VI
-- CREATE TABLE student_class_6(
-- 	student_id text PRIMARY KEY,
-- 	DOB DATE,
-- 	firstname text,
-- 	middle_lastname text,
-- 	fathername text,
-- 	mothername text,
-- 	address text,
-- 	email text,
-- 	tel_num text,
-- 	login_key text
-- );

-- -- class VII
-- CREATE TABLE student_class_7(
-- 	student_id text PRIMARY KEY,
-- 	DOB DATE,
-- 	firstname text,
-- 	middle_lastname text,
-- 	fathername text,
-- 	mothername text,
-- 	address text,
-- 	email text,
-- 	tel_num text,
-- 	login_key text
-- );

-- -- class VIII
-- CREATE TABLE student_class_8(
-- 	student_id text PRIMARY KEY,
-- 	DOB DATE,
-- 	firstname text,
-- 	middle_lastname text,
-- 	fathername text,
-- 	mothername text,
-- 	address text,
-- 	email text,
-- 	tel_num text,
-- 	login_key text
-- );

-- -- class IX
-- CREATE TABLE student_class_9(
-- 	student_id text PRIMARY KEY,
-- 	DOB DATE,
-- 	firstname text,
-- 	middle_lastname text,
-- 	fathername text,
-- 	mothername text,
-- 	address text,
-- 	email text,
-- 	tel_num text,
-- 	login_key text
-- );

-- -- class X
-- CREATE TABLE student_class_10(
-- 	student_id text PRIMARY KEY,
-- 	DOB DATE,
-- 	firstname text,
-- 	middle_lastname text,
-- 	fathername text,
-- 	mothername text,
-- 	address text,
-- 	email text,
-- 	tel_num text,
-- 	login_key text
-- );


-- -- create table for teachers details
-- CREATE TABLE teachers(
-- 	teacher_id text PRIMARY KEY,
-- 	DOB DATE,
-- 	firstname text,
-- 	middle_lastname text,
-- 	fathername text,
-- 	mothername text,
-- 	address text,
-- 	email text,
-- 	tel_num text,
-- 	login_key text
-- );

-- -- create table for management details
-- CREATE TABLE management(
-- 	management_id text PRIMARY KEY,
-- 	DOB DATE,
-- 	firstname text,
-- 	middle_lastname text,
-- 	fathername text,
-- 	mothername text,
-- 	address text,
-- 	email text,
-- 	tel_num text,
-- 	login_key text
-- );

-- -- change exsiting column as primary key 
-- ALTER TABLE student_class_3
-- ADD PRIMARY KEY (student_id);

-- -- add  gender column in each tale
-- ALTER TABLE student_class_2
-- ADD gender text;

-- -- Rename table 
-- ALTER TABLE student_class_02
-- RENAME TO student_class_2;

-- -- drop table
-- DROP TABLE management;

-- delete exsisting records from table
DELETE FROM student_class_10;