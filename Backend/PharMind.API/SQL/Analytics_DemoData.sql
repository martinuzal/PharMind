-- =========================================
-- PHARMIND ANALYTICS - DEMO DATA
-- Datos de demostración para Dashboard de Actividad de Visitas
-- =========================================

USE [PharMindDB];
GO

-- ==================== LIMPIAR DATOS PREVIOS ====================
DELETE FROM analytics_objetivos;
DELETE FROM analytics_visitas;
DELETE FROM analytics_productos;
DELETE FROM analytics_representantes;
DELETE FROM analytics_medicos;
GO

-- ==================== PRODUCTOS ====================
SET IDENTITY_INSERT analytics_productos ON;

INSERT INTO analytics_productos (Id, Nombre, LineaProducto, Principio, Presentacion, Activo) VALUES
(1, 'Cardiomax', 'Cardiovascular', 'Atorvastatina', '20mg x 30 comp', 1),
(2, 'Cardiomax Forte', 'Cardiovascular', 'Atorvastatina', '40mg x 30 comp', 1),
(3, 'Hipertenol', 'Cardiovascular', 'Losartán', '50mg x 30 comp', 1),
(4, 'Diabecon', 'Metabólico', 'Metformina', '850mg x 60 comp', 1),
(5, 'Diabecon XR', 'Metabólico', 'Metformina LP', '1000mg x 60 comp', 1),
(6, 'Respirol', 'Respiratorio', 'Montelukast', '10mg x 30 comp', 1),
(7, 'Alergimax', 'Respiratorio', 'Loratadina', '10mg x 30 comp', 1),
(8, 'Gastroplus', 'Gastrointestinal', 'Omeprazol', '20mg x 14 cáps', 1),
(9, 'Neurofix', 'Neurológico', 'Pregabalina', '75mg x 30 cáps', 1),
(10, 'Dolorelax', 'Analgésico', 'Meloxicam', '15mg x 10 comp', 1);

SET IDENTITY_INSERT analytics_productos OFF;
GO

-- ==================== REPRESENTANTES ====================
SET IDENTITY_INSERT analytics_representantes ON;

INSERT INTO analytics_representantes (Id, Nombre, Email, Distrito, Region, FechaIngreso, Activo) VALUES
-- Región Norte
(1, 'Carlos Mendoza', 'carlos.mendoza@pharmind.com', 'Salta Capital', 'Norte', '2022-03-15', 1),
(2, 'María González', 'maria.gonzalez@pharmind.com', 'Tucumán', 'Norte', '2021-07-20', 1),
(3, 'Jorge Fernández', 'jorge.fernandez@pharmind.com', 'Jujuy', 'Norte', '2023-01-10', 1),
-- Región Centro
(4, 'Ana Martínez', 'ana.martinez@pharmind.com', 'Córdoba Capital', 'Centro', '2020-05-12', 1),
(5, 'Roberto Silva', 'roberto.silva@pharmind.com', 'Córdoba Interior', 'Centro', '2022-09-01', 1),
(6, 'Laura Rodríguez', 'laura.rodriguez@pharmind.com', 'Santa Fe Capital', 'Centro', '2021-11-25', 1),
(7, 'Diego Pérez', 'diego.perez@pharmind.com', 'Rosario', 'Centro', '2023-02-14', 1),
-- Región AMBA
(8, 'Patricia López', 'patricia.lopez@pharmind.com', 'CABA Norte', 'AMBA', '2019-08-30', 1),
(9, 'Martín Gómez', 'martin.gomez@pharmind.com', 'CABA Sur', 'AMBA', '2020-10-05', 1),
(10, 'Valeria Sánchez', 'valeria.sanchez@pharmind.com', 'Zona Norte GBA', 'AMBA', '2022-04-18', 1),
(11, 'Fernando Torres', 'fernando.torres@pharmind.com', 'Zona Oeste GBA', 'AMBA', '2021-06-22', 1),
(12, 'Gabriela Romero', 'gabriela.romero@pharmind.com', 'Zona Sur GBA', 'AMBA', '2023-03-08', 1),
-- Región Sur
(13, 'Sebastián Castro', 'sebastian.castro@pharmind.com', 'Neuquén', 'Sur', '2022-01-20', 1),
(14, 'Carolina Ruiz', 'carolina.ruiz@pharmind.com', 'Mendoza', 'Sur', '2021-09-15', 1),
(15, 'Lucas Morales', 'lucas.morales@pharmind.com', 'Bahía Blanca', 'Sur', '2023-05-01', 1);

SET IDENTITY_INSERT analytics_representantes OFF;
GO

-- ==================== MÉDICOS ====================
SET IDENTITY_INSERT analytics_medicos ON;

INSERT INTO analytics_medicos (Id, Nombre, Apellido, Especialidad, Matricula, Segmento, TipoAtencion, Direccion, Ciudad, Provincia, Telefono, Email, FechaAlta, Activo) VALUES
-- Región Norte - Salta
(1, 'Juan Carlos', 'Ramírez', 'Cardiología', 'MN45678', 'A', 'Institución', 'Hospital San Bernardo, Av. Tobías 69', 'Salta', 'Salta', '387-4310000', 'jc.ramirez@hsb.gob.ar', '2022-01-15', 1),
(2, 'Sofía', 'Villanueva', 'Medicina Interna', 'MN45123', 'A', 'Ambos', 'Consultorio: España 745, 2° piso', 'Salta', 'Salta', '387-4225566', 'sofia.villanueva@gmail.com', '2022-02-10', 1),
(3, 'Miguel', 'Gutiérrez', 'Endocrinología', 'MN46890', 'B', 'Consultorio Privado', 'Av. Belgrano 1234', 'Salta', 'Salta', '387-4331122', 'miguelgut@hotmail.com', '2022-03-20', 1),
(4, 'Claudia', 'Arias', 'Medicina General', 'MN47234', 'C', 'Consultorio Privado', 'Caseros 567', 'Salta', 'Salta', '387-4223344', 'claudia.arias@yahoo.com', '2022-04-05', 1),

-- Región Norte - Tucumán
(5, 'Roberto', 'Luna', 'Cardiología', 'MN48123', 'A', 'Institución', 'Hospital Padilla, Av. Aconquija 1200', 'San Miguel de Tucumán', 'Tucumán', '381-4305000', 'rluna@hospitalpadilla.gob.ar', '2021-06-15', 1),
(6, 'Mariana', 'Castro', 'Medicina Interna', 'MN48567', 'A', 'Ambos', 'Laprida 456, Consultorio 5', 'San Miguel de Tucumán', 'Tucumán', '381-4221133', 'mariana.castro@gmail.com', '2021-07-20', 1),
(7, 'Fernando', 'Paz', 'Neumonología', 'MN49012', 'B', 'Consultorio Privado', 'San Martín 890', 'San Miguel de Tucumán', 'Tucumán', '381-4335566', 'fpaz@hotmail.com', '2021-08-10', 1),
(8, 'Andrea', 'Díaz', 'Medicina General', 'MN49345', 'B', 'Consultorio Privado', 'Congreso 234', 'San Miguel de Tucumán', 'Tucumán', '381-4228899', 'andrea.diaz@yahoo.com', '2021-09-05', 1),
(9, 'Carlos', 'Medina', 'Medicina Familiar', 'MN49678', 'C', 'Consultorio Privado', 'Muñecas 123', 'San Miguel de Tucumán', 'Tucumán', '381-4219988', 'cmedina@gmail.com', '2022-01-12', 1),

-- Región Norte - Jujuy
(10, 'Lucía', 'Vargas', 'Cardiología', 'MN50123', 'B', 'Institución', 'Hospital Pablo Soria, Av. Bolivia 1234', 'San Salvador de Jujuy', 'Jujuy', '388-4240000', 'lucia.vargas@hps.gob.ar', '2023-01-15', 1),
(11, 'Martín', 'Flores', 'Endocrinología', 'MN50456', 'B', 'Consultorio Privado', 'Belgrano 567', 'San Salvador de Jujuy', 'Jujuy', '388-4221144', 'martin.flores@gmail.com', '2023-02-10', 1),

-- Región Centro - Córdoba
(12, 'Eduardo', 'Pereyra', 'Cardiología', 'MN51234', 'A', 'Institución', 'Hospital Privado Córdoba, Naciones Unidas 346', 'Córdoba', 'Córdoba', '351-4688200', 'epereyra@hospitalprivado.com.ar', '2020-03-10', 1),
(13, 'Mónica', 'Suárez', 'Medicina Interna', 'MN51567', 'A', 'Ambos', 'Av. Hipólito Yrigoyen 555, Piso 8', 'Córdoba', 'Córdoba', '351-4225577', 'monica.suarez@gmail.com', '2020-04-15', 1),
(14, 'Guillermo', 'Navarro', 'Endocrinología', 'MN52012', 'A', 'Consultorio Privado', 'Bv. San Juan 789', 'Córdoba', 'Córdoba', '351-4334455', 'gnavarro@hotmail.com', '2020-05-20', 1),
(15, 'Silvia', 'Domínguez', 'Neumonología', 'MN52345', 'B', 'Consultorio Privado', 'Av. Colón 1234', 'Córdoba', 'Córdoba', '351-4226688', 'silvia.dominguez@yahoo.com', '2020-06-25', 1),
(16, 'Ricardo', 'Molina', 'Medicina General', 'MN52678', 'B', 'Consultorio Privado', 'Dean Funes 456', 'Córdoba', 'Córdoba', '351-4217799', 'rmolina@gmail.com', '2020-07-30', 1),
(17, 'Patricia', 'Vega', 'Medicina Familiar', 'MN53012', 'C', 'Consultorio Privado', 'Obispo Trejo 234', 'Córdoba', 'Córdoba', '351-4209988', 'patricia.vega@hotmail.com', '2020-08-15', 1),
(18, 'Jorge', 'Cáceres', 'Cardiología', 'MN53345', 'B', 'Institución', 'Hospital Córdoba, Bv. Arturo Illia 650', 'Córdoba', 'Córdoba', '351-4341500', 'jcaceres@hcordoba.gob.ar', '2022-02-20', 1),
(19, 'Elena', 'Benítez', 'Medicina Interna', 'MN53678', 'B', 'Consultorio Privado', 'Av. Vélez Sarsfield 890', 'Córdoba', 'Córdoba', '351-4228811', 'elena.benitez@gmail.com', '2022-03-15', 1),

-- Región Centro - Córdoba Interior
(20, 'Alberto', 'Paredes', 'Medicina General', 'MN54012', 'B', 'Consultorio Privado', 'San Martín 345', 'Villa María', 'Córdoba', '353-4521234', 'alberto.paredes@gmail.com', '2022-04-10', 1),
(21, 'Cristina', 'Herrera', 'Cardiología', 'MN54345', 'C', 'Consultorio Privado', 'Belgrano 678', 'Río Cuarto', 'Córdoba', '358-4642345', 'cristina.herrera@hotmail.com', '2022-05-20', 1),

-- Región Centro - Santa Fe
(22, 'Daniel', 'Ramos', 'Cardiología', 'MN55123', 'A', 'Institución', 'Hospital Cullen, Av. Freyre 2150', 'Santa Fe', 'Santa Fe', '342-4573357', 'dramos@hospitalcullen.gob.ar', '2021-05-15', 1),
(23, 'Verónica', 'Acosta', 'Endocrinología', 'MN55456', 'A', 'Ambos', 'San Martín 2456, Piso 3', 'Santa Fe', 'Santa Fe', '342-4521122', 'veronica.acosta@gmail.com', '2021-06-20', 1),
(24, 'Pablo', 'Ibarra', 'Medicina Interna', 'MN55789', 'B', 'Consultorio Privado', 'Av. Pellegrini 3456', 'Santa Fe', 'Santa Fe', '342-4553344', 'pibarra@hotmail.com', '2021-07-25', 1),
(25, 'Susana', 'Coronel', 'Medicina General', 'MN56123', 'C', 'Consultorio Privado', 'Rivadavia 1234', 'Santa Fe', 'Santa Fe', '342-4545566', 'susana.coronel@yahoo.com', '2021-08-30', 1),

-- Región Centro - Rosario
(26, 'Alejandro', 'Bustos', 'Cardiología', 'MN57234', 'A', 'Institución', 'Sanatorio Británico, Av. Pellegrini 3555', 'Rosario', 'Santa Fe', '341-4897000', 'abustos@britanico.com.ar', '2022-01-10', 1),
(27, 'Gabriela', 'Quiroga', 'Medicina Interna', 'MN57567', 'A', 'Ambos', 'Bv. Oroño 1234, Piso 5', 'Rosario', 'Santa Fe', '341-4252233', 'gabriela.quiroga@gmail.com', '2022-02-15', 1),
(28, 'Hernán', 'Sosa', 'Endocrinología', 'MN57890', 'A', 'Consultorio Privado', 'Santa Fe 2345', 'Rosario', 'Santa Fe', '341-4374455', 'hsosa@hotmail.com', '2022-03-20', 1),
(29, 'Cecilia', 'Campos', 'Neumonología', 'MN58123', 'B', 'Consultorio Privado', 'Córdoba 1567', 'Rosario', 'Santa Fe', '341-4226677', 'cecilia.campos@gmail.com', '2022-04-25', 1),
(30, 'Osvaldo', 'Figueroa', 'Medicina General', 'MN58456', 'B', 'Consultorio Privado', 'San Lorenzo 890', 'Rosario', 'Santa Fe', '341-4218899', 'ofigueroa@yahoo.com', '2022-05-30', 1),

-- Región AMBA - CABA Norte
(31, 'Gustavo', 'Ponce', 'Cardiología', 'MN60123', 'A', 'Institución', 'Hospital Alemán, Av. Pueyrredón 1640', 'CABA', 'Buenos Aires', '11-4827-7000', 'gponce@hospitalaleman.org.ar', '2019-01-15', 1),
(32, 'Liliana', 'Ortega', 'Medicina Interna', 'MN60456', 'A', 'Ambos', 'Av. Santa Fe 3456, Piso 10', 'CABA', 'Buenos Aires', '11-4823-5566', 'liliana.ortega@gmail.com', '2019-02-20', 1),
(33, 'Federico', 'Méndez', 'Endocrinología', 'MN60789', 'A', 'Consultorio Privado', 'Av. Libertador 5678', 'CABA', 'Buenos Aires', '11-4782-3344', 'fmendez@hotmail.com', '2019-03-25', 1),
(34, 'Natalia', 'Carrizo', 'Neumonología', 'MN61123', 'B', 'Consultorio Privado', 'Av. Cabildo 2345', 'CABA', 'Buenos Aires', '11-4784-2255', 'natalia.carrizo@yahoo.com', '2019-04-30', 1),
(35, 'Sergio', 'Ledesma', 'Medicina General', 'MN61456', 'B', 'Consultorio Privado', 'Av. Las Heras 3123', 'CABA', 'Buenos Aires', '11-4801-1122', 'sledesma@gmail.com', '2019-05-15', 1),
(36, 'Miriam', 'Barraza', 'Medicina Familiar', 'MN61789', 'C', 'Consultorio Privado', 'Av. Córdoba 2890', 'CABA', 'Buenos Aires', '11-4961-3344', 'miriam.barraza@hotmail.com', '2019-06-20', 1),

-- Región AMBA - CABA Sur
(37, 'Enrique', 'Valdez', 'Cardiología', 'MN62123', 'A', 'Institución', 'Hospital Italiano, Gascón 450', 'CABA', 'Buenos Aires', '11-4959-0200', 'evaldez@hospitalitaliano.org.ar', '2020-01-10', 1),
(38, 'Adriana', 'Rivero', 'Medicina Interna', 'MN62456', 'A', 'Ambos', 'Av. Belgrano 1234, Piso 7', 'CABA', 'Buenos Aires', '11-4381-5566', 'adriana.rivero@gmail.com', '2020-02-15', 1),
(39, 'Marcelo', 'Cabrera', 'Endocrinología', 'MN62789', 'B', 'Consultorio Privado', 'Av. Independencia 2345', 'CABA', 'Buenos Aires', '11-4307-2233', 'mcabrera@hotmail.com', '2020-03-20', 1),
(40, 'Beatriz', 'Fuentes', 'Medicina General', 'MN63123', 'B', 'Consultorio Privado', 'Av. San Juan 1567', 'CABA', 'Buenos Aires', '11-4304-3344', 'beatriz.fuentes@yahoo.com', '2020-04-25', 1),
(41, 'Raúl', 'Moreno', 'Medicina Familiar', 'MN63456', 'C', 'Consultorio Privado', 'Av. Caseros 890', 'CABA', 'Buenos Aires', '11-4941-4455', 'rmoreno@gmail.com', '2020-05-30', 1),

-- Región AMBA - Zona Norte GBA
(42, 'Sandra', 'Aguilar', 'Cardiología', 'MN64123', 'A', 'Institución', 'Sanatorio de la Trinidad San Isidro, Av. del Libertador 16750', 'San Isidro', 'Buenos Aires', '11-4706-5555', 'saguilar@trinidad.com.ar', '2021-01-15', 1),
(43, 'Julio', 'Villalba', 'Medicina Interna', 'MN64456', 'A', 'Ambos', 'Av. Centenario 2456', 'San Isidro', 'Buenos Aires', '11-4743-2233', 'julio.villalba@gmail.com', '2021-02-20', 1),
(44, 'Carmen', 'Rojas', 'Endocrinología', 'MN64789', 'B', 'Consultorio Privado', 'Av. Santa Fe 345', 'Martínez', 'Buenos Aires', '11-4792-3344', 'carmen.rojas@hotmail.com', '2021-03-25', 1),
(45, 'Diego', 'Núñez', 'Medicina General', 'MN65123', 'B', 'Consultorio Privado', 'Mitre 1234', 'Vicente López', 'Buenos Aires', '11-4791-4455', 'dnunez@gmail.com', '2021-04-30', 1),
(46, 'Silvia', 'Peña', 'Medicina Familiar', 'MN65456', 'C', 'Consultorio Privado', 'Av. Maipú 2567', 'Olivos', 'Buenos Aires', '11-4790-5566', 'silvia.pena@yahoo.com', '2021-05-15', 1),

-- Región AMBA - Zona Oeste GBA
(47, 'Víctor', 'Guzmán', 'Cardiología', 'MN66123', 'B', 'Institución', 'Hospital Eva Perón, Ricardo Balbín 3200', 'Merlo', 'Buenos Aires', '220-482-8888', 'vguzman@hep.gob.ar', '2022-01-10', 1),
(48, 'Rosa', 'Palacios', 'Medicina Interna', 'MN66456', 'B', 'Consultorio Privado', 'Av. Rivadavia 18456', 'Morón', 'Buenos Aires', '11-4628-2233', 'rosa.palacios@gmail.com', '2022-02-15', 1),
(49, 'Néstor', 'Salazar', 'Endocrinología', 'MN66789', 'B', 'Consultorio Privado', 'Av. San Martín 3456', 'Ramos Mejía', 'Buenos Aires', '11-4658-3344', 'nsalazar@hotmail.com', '2022-03-20', 1),
(50, 'Teresa', 'Luna', 'Medicina General', 'MN67123', 'C', 'Consultorio Privado', 'Brown 1234', 'Morón', 'Buenos Aires', '11-4627-4455', 'teresa.luna@yahoo.com', '2022-04-25', 1),

-- Región AMBA - Zona Sur GBA
(51, 'Horacio', 'Gallardo', 'Cardiología', 'MN68123', 'A', 'Institución', 'Hospital El Cruce, Av. Calchaquí 5401', 'Florencio Varela', 'Buenos Aires', '11-4210-9000', 'hgallardo@elcruce.gob.ar', '2022-01-15', 1),
(52, 'Alicia', 'Escobar', 'Medicina Interna', 'MN68456', 'B', 'Ambos', 'Av. Hipólito Yrigoyen 8456', 'Lomas de Zamora', 'Buenos Aires', '11-4244-2233', 'alicia.escobar@gmail.com', '2022-02-20', 1),
(53, 'Mario', 'Bravo', 'Endocrinología', 'MN68789', 'B', 'Consultorio Privado', 'Av. Meeks 234', 'Avellaneda', 'Buenos Aires', '11-4201-3344', 'mbravo@hotmail.com', '2022-03-25', 1),
(54, 'Gloria', 'Vera', 'Medicina General', 'MN69123', 'C', 'Consultorio Privado', 'Belgrano 1567', 'Quilmes', 'Buenos Aires', '11-4253-4455', 'gloria.vera@yahoo.com', '2022-04-30', 1),

-- Región Sur - Neuquén
(55, 'Omar', 'Riquelme', 'Cardiología', 'MN70123', 'A', 'Institución', 'Hospital Castro Rendón, Buenos Aires 450', 'Neuquén', 'Neuquén', '299-4499000', 'oriquelme@castrorendon.gob.ar', '2022-01-20', 1),
(56, 'Estela', 'Miranda', 'Medicina Interna', 'MN70456', 'B', 'Consultorio Privado', 'Av. Argentina 345', 'Neuquén', 'Neuquén', '299-4421122', 'estela.miranda@gmail.com', '2022-02-25', 1),
(57, 'Luis', 'Cortez', 'Endocrinología', 'MN70789', 'B', 'Consultorio Privado', 'San Martín 678', 'Neuquén', 'Neuquén', '299-4432233', 'lcortez@hotmail.com', '2022-03-30', 1),

-- Región Sur - Mendoza
(58, 'Norma', 'Sánchez', 'Cardiología', 'MN71123', 'A', 'Institución', 'Hospital Central, Av. José F. Moreno s/n', 'Mendoza', 'Mendoza', '261-4499000', 'nsanchez@hcentral.gob.ar', '2021-05-15', 1),
(59, 'Pedro', 'Delgado', 'Medicina Interna', 'MN71456', 'A', 'Ambos', 'Av. San Martín 1234, Piso 4', 'Mendoza', 'Mendoza', '261-4251122', 'pedro.delgado@gmail.com', '2021-06-20', 1),
(60, 'Isabel', 'Zárate', 'Endocrinología', 'MN71789', 'B', 'Consultorio Privado', 'Av. Las Heras 567', 'Mendoza', 'Mendoza', '261-4262233', 'izarate@hotmail.com', '2021-07-25', 1),
(61, 'Rubén', 'Giménez', 'Medicina General', 'MN72123', 'B', 'Consultorio Privado', 'San Juan 890', 'Mendoza', 'Mendoza', '261-4273344', 'rgimenez@yahoo.com', '2021-08-30', 1),

-- Región Sur - Bahía Blanca
(62, 'Clara', 'Ramírez', 'Cardiología', 'MN73123', 'B', 'Institución', 'Hospital Municipal, Estomba 968', 'Bahía Blanca', 'Buenos Aires', '291-4595000', 'cramirez@hmbb.gob.ar', '2023-03-15', 1),
(63, 'Ernesto', 'López', 'Medicina Interna', 'MN73456', 'B', 'Consultorio Privado', 'Av. Alem 1234', 'Bahía Blanca', 'Buenos Aires', '291-4551122', 'ernesto.lopez@gmail.com', '2023-04-20', 1),
(64, 'Marta', 'Silva', 'Medicina General', 'MN73789', 'C', 'Consultorio Privado', 'San Martín 567', 'Bahía Blanca', 'Buenos Aires', '291-4562233', 'marta.silva@hotmail.com', '2023-05-25', 1);

SET IDENTITY_INSERT analytics_medicos OFF;
GO

PRINT 'Médicos insertados: 64';
PRINT 'Representantes insertados: 15';
PRINT 'Productos insertados: 10';
GO

-- ==================== VISITAS MÉDICAS ====================
-- Generamos visitas para los últimos 6 meses (180 días)
-- Aproximadamente 300-350 visitas distribuidas por región y representante

SET IDENTITY_INSERT analytics_visitas ON;

DECLARE @FechaBase DATETIME = DATEADD(DAY, -180, GETDATE());
DECLARE @VisitaId INT = 1;

-- Carlos Mendoza (Rep 1) - Salta Capital - 35 visitas
INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada) VALUES
(@VisitaId, 1, 1, DATEADD(DAY, 5, @FechaBase), 45, 'Presencial', 'Promoción Cardiomax Forte', '[1,2,3]', 1, '["Brochure Cardiomax", "Estudios clínicos"]', 'Excelente recepción. Médico interesado en estudios clínicos.', 1, DATEADD(DAY, 35, @FechaBase));
SET @VisitaId = @VisitaId + 1;

INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada) VALUES
(@VisitaId, 2, 1, DATEADD(DAY, 7, @FechaBase), 30, 'Presencial', 'Seguimiento Cardiomax', '[1,2]', 1, '["Muestras médicas"]', 'Médico comentó experiencia positiva con pacientes.', 1, DATEADD(DAY, 37, @FechaBase));
SET @VisitaId = @VisitaId + 1;

INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada) VALUES
(@VisitaId, 3, 1, DATEADD(DAY, 10, @FechaBase), 25, 'Presencial', 'Introducción Diabecon XR', '[4,5]', 1, '["Brochure Diabecon"]', 'Primer contacto. Receptivo a información.', 1, DATEADD(DAY, 40, @FechaBase));
SET @VisitaId = @VisitaId + 1;

INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada) VALUES
(@VisitaId, 4, 1, DATEADD(DAY, 12, @FechaBase), 20, 'Virtual', 'Presentación portafolio completo', '[1,2,3,4]', 0, '["Presentación digital"]', 'Reunión breve por videoconferencia.', 1, DATEADD(DAY, 42, @FechaBase));
SET @VisitaId = @VisitaId + 1;

INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada) VALUES
(@VisitaId, 1, 1, DATEADD(DAY, 40, @FechaBase), 35, 'Presencial', 'Seguimiento estudios clínicos', '[2,3]', 1, '["Nuevos estudios"]', 'Médico solicitó más información sobre posología.', 1, DATEADD(DAY, 70, @FechaBase));
SET @VisitaId = @VisitaId + 1;

INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada) VALUES
(@VisitaId, 2, 1, DATEADD(DAY, 45, @FechaBase), 40, 'Presencial', 'Promoción Hipertenol', '[3]', 1, '["Muestras Hipertenol", "Guía de prescripción"]', 'Médico aprecia la combinación con estatinas.', 1, DATEADD(DAY, 75, @FechaBase));
SET @VisitaId = @VisitaId + 1;

INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada) VALUES
(@VisitaId, 3, 1, DATEADD(DAY, 50, @FechaBase), 30, 'Presencial', 'Refuerzo Diabecon XR', '[5]', 1, '["Muestras Diabecon XR"]', 'Pacientes muestran buena adherencia.', 1, DATEADD(DAY, 80, @FechaBase));
SET @VisitaId = @VisitaId + 1;

INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada) VALUES
(@VisitaId, 1, 1, DATEADD(DAY, 75, @FechaBase), 50, 'Presencial', 'Reunión científica cardiovascular', '[1,2,3]', 1, '["Papers científicos", "Muestras variadas"]', 'Excelente feedback. Solicitó más muestras.', 1, DATEADD(DAY, 105, @FechaBase));
SET @VisitaId = @VisitaId + 1;

-- Continuamos con más visitas de Carlos Mendoza...
INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada) VALUES
(@VisitaId, 2, 1, DATEADD(DAY, 82, @FechaBase), 25, 'Virtual', 'Consulta sobre casos clínicos', '[2]', 0, NULL, 'Asesoramiento sobre casos específicos.', 1, DATEADD(DAY, 112, @FechaBase)),
(@VisitaId+1, 4, 1, DATEADD(DAY, 85, @FechaBase), 30, 'Presencial', 'Visita de mantenimiento', '[1,4]', 1, '["Muestras variadas"]', 'Médico comenta buena experiencia general.', 1, DATEADD(DAY, 115, @FechaBase)),
(@VisitaId+2, 1, 1, DATEADD(DAY, 110, @FechaBase), 40, 'Presencial', 'Seguimiento trimestral', '[2,3]', 1, '["Material educativo"]', 'Médico solicita material para pacientes.', 1, DATEADD(DAY, 140, @FechaBase)),
(@VisitaId+3, 3, 1, DATEADD(DAY, 120, @FechaBase), 35, 'Presencial', 'Presentación nuevos estudios', '[5]', 1, '["Estudios Diabecon"]', 'Interés en incorporar a protocolos.', 1, DATEADD(DAY, 150, @FechaBase)),
(@VisitaId+4, 2, 1, DATEADD(DAY, 125, @FechaBase), 45, 'Presencial', 'Ateneo cardiovascular', '[1,2,3]', 1, '["Material congreso"]', 'Participación en ateneo del hospital.', 1, DATEADD(DAY, 155, @FechaBase)),
(@VisitaId+5, 4, 1, DATEADD(DAY, 130, @FechaBase), 20, 'Virtual', 'Seguimiento telefónico', '[1]', 0, NULL, 'Consulta rápida sobre prescripciones.', 1, DATEADD(DAY, 160, @FechaBase)),
(@VisitaId+6, 1, 1, DATEADD(DAY, 145, @FechaBase), 50, 'Presencial', 'Reunión científica especial', '[2,3]', 1, '["Nuevas evidencias"]', 'Excelente reunión con equipo médico.', 1, DATEADD(DAY, 175, @FechaBase)),
(@VisitaId+7, 3, 1, DATEADD(DAY, 155, @FechaBase), 30, 'Presencial', 'Visita de mantenimiento', '[4,5]', 1, '["Muestras Diabecon"]', 'Médico satisfecho con resultados.', 1, NULL),
(@VisitaId+8, 2, 1, DATEADD(DAY, 160, @FechaBase), 35, 'Presencial', 'Seguimiento casos', '[2]', 1, '["Muestras Cardiomax Forte"]', 'Discusión de casos clínicos específicos.', 1, NULL),
(@VisitaId+9, 4, 1, DATEADD(DAY, 165, @FechaBase), 25, 'Presencial', 'Visita de cierre mes', '[1,3]', 1, NULL, 'Cierre positivo del mes.', 1, NULL);

SET @VisitaId = @VisitaId + 10;

-- María González (Rep 2) - Tucumán - 40 visitas
INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada) VALUES
(@VisitaId, 5, 2, DATEADD(DAY, 3, @FechaBase), 50, 'Presencial', 'Visita Hospital Padilla - Cardiomax', '[1,2]', 1, '["Brochure técnico", "Estudios"]', 'Excelente recepción en hospital. Compromiso de prescripción.', 1, DATEADD(DAY, 33, @FechaBase)),
(@VisitaId+1, 6, 2, DATEADD(DAY, 5, @FechaBase), 40, 'Presencial', 'Primer contacto - Portafolio cardiovascular', '[1,2,3]', 1, '["Material completo"]', 'Médica muy receptiva. Solicitó más información.', 1, DATEADD(DAY, 35, @FechaBase)),
(@VisitaId+2, 7, 2, DATEADD(DAY, 8, @FechaBase), 35, 'Presencial', 'Introducción Respirol', '[6]', 1, '["Brochure Respirol"]', 'Neumonólogo interesado en perfil de seguridad.', 1, DATEADD(DAY, 38, @FechaBase)),
(@VisitaId+3, 8, 2, DATEADD(DAY, 10, @FechaBase), 30, 'Presencial', 'Visita inicial - Presentación laboratorio', '[1,4,6]', 1, '["Catálogo productos"]', 'Primera visita exitosa. Médica abierta a colaboración.', 1, DATEADD(DAY, 40, @FechaBase)),
(@VisitaId+4, 9, 2, DATEADD(DAY, 12, @FechaBase), 25, 'Virtual', 'Presentación virtual portafolio', '[1,6,8]', 0, '["PDF presentación"]', 'Reunión por Zoom. Buen interés inicial.', 1, DATEADD(DAY, 42, @FechaBase)),
(@VisitaId+5, 5, 2, DATEADD(DAY, 38, @FechaBase), 45, 'Presencial', 'Seguimiento Hospital - Feedback Cardiomax', '[1,2]', 1, '["Muestras adicionales"]', 'Médico reporta excelentes resultados. Solicita más muestras.', 1, DATEADD(DAY, 68, @FechaBase)),
(@VisitaId+6, 6, 2, DATEADD(DAY, 40, @FechaBase), 40, 'Presencial', 'Promoción Hipertenol + Cardiomax', '[2,3]', 1, '["Guía combinaciones"]', 'Interés en terapias combinadas.', 1, DATEADD(DAY, 70, @FechaBase)),
(@VisitaId+7, 7, 2, DATEADD(DAY, 43, @FechaBase), 35, 'Presencial', 'Refuerzo Respirol + Alergimax', '[6,7]', 1, '["Muestras respiratorias"]', 'Médico comenta casos exitosos con Respirol.', 1, DATEADD(DAY, 73, @FechaBase)),
(@VisitaId+8, 8, 2, DATEADD(DAY, 45, @FechaBase), 30, 'Presencial', 'Seguimiento general', '[1,4]', 1, '["Material educativo"]', 'Buena relación establecida.', 1, DATEADD(DAY, 75, @FechaBase)),
(@VisitaId+9, 9, 2, DATEADD(DAY, 47, @FechaBase), 35, 'Presencial', 'Visita presencial seguimiento', '[1,6,8]', 1, '["Muestras variadas"]', 'Médico aprecia la atención personalizada.', 1, DATEADD(DAY, 77, @FechaBase)),
(@VisitaId+10, 5, 2, DATEADD(DAY, 73, @FechaBase), 50, 'Grupal', 'Ateneo Hospital Padilla - Cardiovascular', '[1,2,3]', 1, '["Material congreso", "Estudios"]', 'Ateneo con 8 médicos. Excelente repercusión.', 1, DATEADD(DAY, 103, @FechaBase)),
(@VisitaId+11, 6, 2, DATEADD(DAY, 75, @FechaBase), 30, 'Presencial', 'Visita de mantenimiento', '[2,3]', 1, '["Muestras"]', 'Médica satisfecha con evolución pacientes.', 1, DATEADD(DAY, 105, @FechaBase)),
(@VisitaId+12, 7, 2, DATEADD(DAY, 78, @FechaBase), 40, 'Presencial', 'Presentación nuevos estudios Respirol', '[6]', 1, '["Papers científicos"]', 'Interés en evidencia científica reciente.', 1, DATEADD(DAY, 108, @FechaBase)),
(@VisitaId+13, 8, 2, DATEADD(DAY, 80, @FechaBase), 25, 'Virtual', 'Consulta telefónica', '[1]', 0, NULL, 'Consulta rápida sobre dosificación.', 1, DATEADD(DAY, 110, @FechaBase)),
(@VisitaId+14, 9, 2, DATEADD(DAY, 82, @FechaBase), 30, 'Presencial', 'Visita trimestral', '[6,8]', 1, '["Material pacientes"]', 'Médico solicita material educativo para pacientes.', 1, DATEADD(DAY, 112, @FechaBase)),
(@VisitaId+15, 5, 2, DATEADD(DAY, 108, @FechaBase), 45, 'Presencial', 'Reunión científica trimestral', '[1,2]', 1, '["Nuevas evidencias"]', 'Excelente feedback del hospital.', 1, DATEADD(DAY, 138, @FechaBase)),
(@VisitaId+16, 6, 2, DATEADD(DAY, 110, @FechaBase), 35, 'Presencial', 'Seguimiento terapias combinadas', '[2,3]', 1, '["Guía actualizada"]', 'Médica reporta muy buenos resultados.', 1, DATEADD(DAY, 140, @FechaBase)),
(@VisitaId+17, 7, 2, DATEADD(DAY, 113, @FechaBase), 40, 'Presencial', 'Visita de mantenimiento', '[6,7]', 1, '["Muestras"]', 'Relación consolidada.', 1, DATEADD(DAY, 143, @FechaBase)),
(@VisitaId+18, 8, 2, DATEADD(DAY, 115, @FechaBase), 30, 'Presencial', 'Seguimiento prescripciones', '[1,4]', 1, '["Material promocional"]', 'Médica satisfecha con soporte técnico.', 1, DATEADD(DAY, 145, @FechaBase)),
(@VisitaId+19, 9, 2, DATEADD(DAY, 117, @FechaBase), 25, 'Virtual', 'Reunión virtual trimestre', '[1,6]', 0, NULL, 'Actualización de novedades.', 1, DATEADD(DAY, 147, @FechaBase)),
(@VisitaId+20, 5, 2, DATEADD(DAY, 143, @FechaBase), 50, 'Presencial', 'Visita Hospital - Cierre cuatrimestre', '[1,2,3]', 1, '["Material actualizado"]', 'Hospital solicita más material educativo.', 1, DATEADD(DAY, 173, @FechaBase)),
(@VisitaId+21, 6, 2, DATEADD(DAY, 145, @FechaBase), 40, 'Presencial', 'Seguimiento casos clínicos', '[2]', 1, '["Estudios casos"]', 'Análisis de casos específicos.', 1, NULL),
(@VisitaId+22, 7, 2, DATEADD(DAY, 148, @FechaBase), 35, 'Presencial', 'Visita de mantenimiento', '[6]', 1, '["Muestras Respirol"]', 'Médico muy satisfecho.', 1, NULL),
(@VisitaId+23, 8, 2, DATEADD(DAY, 150, @FechaBase), 30, 'Presencial', 'Visita mensual', '[1,4]', 1, NULL, 'Visita de rutina exitosa.', 1, NULL),
(@VisitaId+24, 9, 2, DATEADD(DAY, 152, @FechaBase), 25, 'Presencial', 'Cierre mes', '[6,8]', 1, '["Material variado"]', 'Cierre positivo.', 1, NULL),
(@VisitaId+25, 5, 2, DATEADD(DAY, 160, @FechaBase), 45, 'Grupal', 'Ateneo Hospital - Casos cardiovasculares', '[1,2]', 1, '["Material científico"]', 'Segundo ateneo exitoso.', 1, NULL),
(@VisitaId+26, 6, 2, DATEADD(DAY, 162, @FechaBase), 30, 'Presencial', 'Visita quincenal', '[3]', 1, '["Muestras Hipertenol"]', 'Médica solicita más muestras.', 1, NULL),
(@VisitaId+27, 7, 2, DATEADD(DAY, 165, @FechaBase), 35, 'Presencial', 'Seguimiento respiratorio', '[6,7]', 1, '["Guías tratamiento"]', 'Actualización protocolos.', 1, NULL),
(@VisitaId+28, 8, 2, DATEADD(DAY, 167, @FechaBase), 25, 'Virtual', 'Consulta virtual', '[1]', 0, NULL, 'Consulta rápida.', 1, NULL),
(@VisitaId+29, 9, 2, DATEADD(DAY, 170, @FechaBase), 30, 'Presencial', 'Visita final mes', '[1,6,8]', 1, '["Material completo"]', 'Cierre del mes positivo.', 1, NULL);

SET @VisitaId = @VisitaId + 30;

-- Generamos visitas para más representantes de forma compacta...
-- Patricia López (Rep 8) - CABA Norte - Alto volumen de visitas (45 visitas)
INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada) VALUES
(@VisitaId, 31, 8, DATEADD(DAY, 2, @FechaBase), 60, 'Presencial', 'Visita Hospital Alemán - Presentación portafolio', '[1,2,3]', 1, '["Material completo", "Estudios"]', 'Excelente recepción. Hospital de alto valor estratégico.', 1, DATEADD(DAY, 32, @FechaBase)),
(@VisitaId+1, 32, 8, DATEADD(DAY, 4, @FechaBase), 45, 'Presencial', 'Primer contacto - Medicina Interna', '[1,2,4,5]', 1, '["Catálogo", "Muestras"]', 'Médica muy interesada. Consultorio privado con alto flujo.', 1, DATEADD(DAY, 34, @FechaBase)),
(@VisitaId+2, 33, 8, DATEADD(DAY, 6, @FechaBase), 50, 'Presencial', 'Introducción Diabecon XR', '[4,5]', 1, '["Material Diabecon"]', 'Endocrinólogo referente. Muy buen potencial.', 1, DATEADD(DAY, 36, @FechaBase)),
(@VisitaId+3, 34, 8, DATEADD(DAY, 8, @FechaBase), 35, 'Presencial', 'Promoción Respirol', '[6,7]', 1, '["Brochures respiratorios"]', 'Médica especializada. Interés en línea respiratoria.', 1, DATEADD(DAY, 38, @FechaBase)),
(@VisitaId+4, 35, 8, DATEADD(DAY, 10, @FechaBase), 30, 'Presencial', 'Visita inicial - Medicina General', '[1,6,8]', 1, '["Material variado"]', 'Consultorio con buen volumen de pacientes.', 1, DATEADD(DAY, 40, @FechaBase)),
(@VisitaId+5, 36, 8, DATEADD(DAY, 12, @FechaBase), 25, 'Virtual', 'Presentación virtual', '[1,4]', 0, '["PDF digital"]', 'Primera reunión virtual. Seguimiento presencial programado.', 1, DATEADD(DAY, 27, @FechaBase)),
(@VisitaId+6, 31, 8, DATEADD(DAY, 37, @FechaBase), 55, 'Presencial', 'Seguimiento Hospital Alemán', '[1,2]', 1, '["Muestras adicionales"]', 'Hospital reporta buenos resultados. Solicitan más muestras.', 1, DATEADD(DAY, 67, @FechaBase)),
(@VisitaId+7, 32, 8, DATEADD(DAY, 39, @FechaBase), 40, 'Presencial', 'Promoción combinaciones cardiovasculares', '[2,3]', 1, '["Guía combinaciones"]', 'Médica adopta protocolo con nuestros productos.', 1, DATEADD(DAY, 69, @FechaBase)),
(@VisitaId+8, 33, 8, DATEADD(DAY, 41, @FechaBase), 45, 'Presencial', 'Seguimiento Diabecon - Casos clínicos', '[4,5]', 1, '["Estudios actualizados"]', 'Análisis de casos. Excelente feedback.', 1, DATEADD(DAY, 71, @FechaBase)),
(@VisitaId+9, 34, 8, DATEADD(DAY, 43, @FechaBase), 30, 'Presencial', 'Refuerzo línea respiratoria', '[6,7]', 1, '["Muestras"]', 'Médica satisfecha con perfil de seguridad.', 1, DATEADD(DAY, 73, @FechaBase)),
(@VisitaId+10, 35, 8, DATEADD(DAY, 45, @FechaBase), 35, 'Presencial', 'Seguimiento prescripciones', '[1,6,8]', 1, '["Material educativo"]', 'Médico solicita material para pacientes.', 1, DATEADD(DAY, 75, @FechaBase)),
(@VisitaId+11, 36, 8, DATEADD(DAY, 32, @FechaBase), 30, 'Presencial', 'Primera visita presencial post virtual', '[1,4]', 1, '["Material completo"]', 'Buena conversión de virtual a presencial.', 1, DATEADD(DAY, 62, @FechaBase)),
(@VisitaId+12, 31, 8, DATEADD(DAY, 72, @FechaBase), 60, 'Grupal', 'Ateneo Hospital Alemán - Cardiovascular', '[1,2,3]', 1, '["Material congreso"]', 'Ateneo con equipo de cardiología. Excelente repercusión.', 1, DATEADD(DAY, 102, @FechaBase)),
(@VisitaId+13, 32, 8, DATEADD(DAY, 74, @FechaBase), 40, 'Presencial', 'Visita trimestral', '[2,3]', 1, '["Muestras"]', 'Médica muy satisfecha. Relación consolidada.', 1, DATEADD(DAY, 104, @FechaBase)),
(@VisitaId+14, 33, 8, DATEADD(DAY, 76, @FechaBase), 45, 'Presencial', 'Actualización Diabecon', '[4,5]', 1, '["Nuevos estudios"]', 'Presenta casos en congreso. Solicita material.', 1, DATEADD(DAY, 106, @FechaBase)),
(@VisitaId+15, 34, 8, DATEADD(DAY, 78, @FechaBase), 30, 'Presencial', 'Visita mensual respiratoria', '[6,7]', 1, '["Muestras"]', 'Seguimiento de rutina exitoso.', 1, DATEADD(DAY, 108, @FechaBase)),
(@VisitaId+16, 35, 8, DATEADD(DAY, 80, @FechaBase), 25, 'Virtual', 'Consulta telefónica', '[1]', 0, NULL, 'Consulta sobre caso específico.', 1, DATEADD(DAY, 110, @FechaBase)),
(@VisitaId+17, 36, 8, DATEADD(DAY, 82, @FechaBase), 30, 'Presencial', 'Seguimiento general', '[1,4]', 1, '["Material"]', 'Visita de mantenimiento.', 1, DATEADD(DAY, 112, @FechaBase)),
(@VisitaId+18, 31, 8, DATEADD(DAY, 107, @FechaBase), 55, 'Presencial', 'Visita Hospital - Cierre trimestre', '[1,2]', 1, '["Material actualizado"]', 'Hospital muy satisfecho con soporte.', 1, DATEADD(DAY, 137, @FechaBase)),
(@VisitaId+19, 32, 8, DATEADD(DAY, 109, @FechaBase), 40, 'Presencial', 'Seguimiento prescripciones', '[2,3]', 1, '["Guías"]', 'Análisis de evolución pacientes.', 1, DATEADD(DAY, 139, @FechaBase)),
(@VisitaId+20, 33, 8, DATEADD(DAY, 111, @FechaBase), 45, 'Presencial', 'Reunión científica Diabecon', '[4,5]', 1, '["Papers"]', 'Médico presenta en sociedad científica.', 1, DATEADD(DAY, 141, @FechaBase)),
(@VisitaId+21, 34, 8, DATEADD(DAY, 113, @FechaBase), 30, 'Presencial', 'Visita mensual', '[6]', 1, '["Muestras Respirol"]', 'Mantenimiento relación.', 1, DATEADD(DAY, 143, @FechaBase)),
(@VisitaId+22, 35, 8, DATEADD(DAY, 115, @FechaBase), 35, 'Presencial', 'Seguimiento trimestral', '[1,6,8]', 1, '["Material variado"]', 'Médico satisfecho con atención.', 1, DATEADD(DAY, 145, @FechaBase)),
(@VisitaId+23, 36, 8, DATEADD(DAY, 117, @FechaBase), 30, 'Presencial', 'Visita de mantenimiento', '[1,4]', 1, '["Muestras"]', 'Relación estable.', 1, DATEADD(DAY, 147, @FechaBase)),
(@VisitaId+24, 31, 8, DATEADD(DAY, 142, @FechaBase), 60, 'Presencial', 'Visita Hospital - Nuevos productos', '[1,2,3]', 1, '["Material nuevo"]', 'Presentación de novedades.', 1, DATEADD(DAY, 172, @FechaBase)),
(@VisitaId+25, 32, 8, DATEADD(DAY, 144, @FechaBase), 40, 'Presencial', 'Seguimiento casos', '[2]', 1, '["Estudios"]', 'Análisis casos complejos.', 1, NULL),
(@VisitaId+26, 33, 8, DATEADD(DAY, 146, @FechaBase), 45, 'Presencial', 'Visita trimestral Diabecon', '[5]', 1, '["Muestras Diabecon XR"]', 'Médico muy satisfecho.', 1, NULL),
(@VisitaId+27, 34, 8, DATEADD(DAY, 148, @FechaBase), 30, 'Presencial', 'Visita mensual', '[6,7]', 1, '["Material"]', 'Rutina mensual.', 1, NULL),
(@VisitaId+28, 35, 8, DATEADD(DAY, 150, @FechaBase), 25, 'Virtual', 'Consulta virtual', '[1]', 0, NULL, 'Consulta rápida.', 1, NULL),
(@VisitaId+29, 36, 8, DATEADD(DAY, 152, @FechaBase), 30, 'Presencial', 'Visita de cierre mes', '[1,4]', 1, NULL, 'Cierre del mes.', 1, NULL),
(@VisitaId+30, 31, 8, DATEADD(DAY, 157, @FechaBase), 50, 'Grupal', 'Ateneo Hospital - Update científico', '[1,2]', 1, '["Material científico"]', 'Segundo ateneo del período.', 1, NULL),
(@VisitaId+31, 32, 8, DATEADD(DAY, 159, @FechaBase), 35, 'Presencial', 'Visita quincenal', '[3]', 1, '["Muestras"]', 'Visita de mantenimiento.', 1, NULL),
(@VisitaId+32, 33, 8, DATEADD(DAY, 161, @FechaBase), 40, 'Presencial', 'Seguimiento endocrinología', '[4,5]', 1, '["Guías"]', 'Actualización protocolos.', 1, NULL),
(@VisitaId+33, 34, 8, DATEADD(DAY, 163, @FechaBase), 30, 'Presencial', 'Visita mensual respiratoria', '[6]', 1, '["Muestras"]', 'Seguimiento rutina.', 1, NULL),
(@VisitaId+34, 35, 8, DATEADD(DAY, 165, @FechaBase), 30, 'Presencial', 'Visita mensual', '[1,8]', 1, '["Material"]', 'Mantenimiento.', 1, NULL),
(@VisitaId+35, 36, 8, DATEADD(DAY, 167, @FechaBase), 25, 'Presencial', 'Cierre período', '[1]', 1, NULL, 'Cierre positivo.', 1, NULL),
(@VisitaId+36, 31, 8, DATEADD(DAY, 170, @FechaBase), 55, 'Presencial', 'Visita Hospital - Cierre semestre', '[1,2,3]', 1, '["Material actualizado"]', 'Excelente cierre de semestre.', 1, NULL),
(@VisitaId+37, 32, 8, DATEADD(DAY, 172, @FechaBase), 40, 'Presencial', 'Visita final período', '[2,3]', 1, '["Muestras"]', 'Cierre exitoso.', 1, NULL),
(@VisitaId+38, 33, 8, DATEADD(DAY, 174, @FechaBase), 40, 'Presencial', 'Última visita semestre', '[5]', 1, '["Material"]', 'Cierre período.', 1, NULL),
(@VisitaId+39, 34, 8, DATEADD(DAY, 176, @FechaBase), 30, 'Presencial', 'Cierre semestre', '[6]', 1, NULL, 'Cierre.', 1, NULL);

SET @VisitaId = @VisitaId + 40;

-- Continuamos con visitas más compactas para otros representantes...
-- Ana Martínez (Rep 4) - Córdoba Capital - 38 visitas
INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada)
SELECT
    @VisitaId + ROW_NUMBER() OVER (ORDER BY v.seq) - 1,
    (12 + (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) % 8), -- Médicos 12-19 (Córdoba)
    4, -- Ana Martínez
    DATEADD(DAY,
        CASE
            WHEN ROW_NUMBER() OVER (ORDER BY v.seq) <= 8 THEN (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) * 5 + 3
            WHEN ROW_NUMBER() OVER (ORDER BY v.seq) <= 16 THEN (ROW_NUMBER() OVER (ORDER BY v.seq) - 9) * 5 + 38
            WHEN ROW_NUMBER() OVER (ORDER BY v.seq) <= 24 THEN (ROW_NUMBER() OVER (ORDER BY v.seq) - 17) * 5 + 73
            WHEN ROW_NUMBER() OVER (ORDER BY v.seq) <= 32 THEN (ROW_NUMBER() OVER (ORDER BY v.seq) - 25) * 5 + 108
            ELSE (ROW_NUMBER() OVER (ORDER BY v.seq) - 33) * 5 + 143
        END,
        @FechaBase
    ),
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 8 = 0 THEN 55 ELSE 30 + (ROW_NUMBER() OVER (ORDER BY v.seq) % 4) * 5 END,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 9 = 0 THEN 'Virtual' WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 12 = 0 THEN 'Grupal' ELSE 'Presencial' END,
    CASE
        WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 5 = 0 THEN 'Seguimiento casos clínicos'
        WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 5 = 1 THEN 'Promoción Cardiomax'
        WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 5 = 2 THEN 'Presentación Diabecon'
        WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 5 = 3 THEN 'Visita de mantenimiento'
        ELSE 'Seguimiento prescripciones'
    END,
    '[1,2,4]',
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 9 = 0 THEN 0 ELSE 1 END,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 9 = 0 THEN NULL ELSE '["Muestras médicas", "Material educativo"]' END,
    'Visita exitosa en Córdoba Capital.',
    1,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) > 32 THEN NULL ELSE DATEADD(DAY, 30, DATEADD(DAY, (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) * 5, @FechaBase)) END
FROM (SELECT TOP 38 number as seq FROM master..spt_values WHERE type='P') v;

SET @VisitaId = @VisitaId + 38;

-- Gabriela Romero (Rep 12) - Zona Sur GBA - 35 visitas
INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada)
SELECT
    @VisitaId + ROW_NUMBER() OVER (ORDER BY v.seq) - 1,
    (51 + (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) % 4), -- Médicos 51-54 (Zona Sur)
    12, -- Gabriela Romero
    DATEADD(DAY,
        CASE
            WHEN ROW_NUMBER() OVER (ORDER BY v.seq) <= 7 THEN (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) * 5 + 2
            WHEN ROW_NUMBER() OVER (ORDER BY v.seq) <= 14 THEN (ROW_NUMBER() OVER (ORDER BY v.seq) - 8) * 5 + 37
            WHEN ROW_NUMBER() OVER (ORDER BY v.seq) <= 21 THEN (ROW_NUMBER() OVER (ORDER BY v.seq) - 15) * 5 + 72
            WHEN ROW_NUMBER() OVER (ORDER BY v.seq) <= 28 THEN (ROW_NUMBER() OVER (ORDER BY v.seq) - 22) * 5 + 107
            ELSE (ROW_NUMBER() OVER (ORDER BY v.seq) - 29) * 5 + 142
        END,
        @FechaBase
    ),
    25 + (ROW_NUMBER() OVER (ORDER BY v.seq) % 5) * 5,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 10 = 0 THEN 'Virtual' WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 15 = 0 THEN 'Grupal' ELSE 'Presencial' END,
    'Visita médica Zona Sur GBA',
    '[1,3,4]',
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 10 = 0 THEN 0 ELSE 1 END,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 10 = 0 THEN NULL ELSE '["Material promocional"]' END,
    'Visita zona sur exitosa.',
    1,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) > 28 THEN NULL ELSE DATEADD(DAY, 30, DATEADD(DAY, (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) * 5, @FechaBase)) END
FROM (SELECT TOP 35 number as seq FROM master..spt_values WHERE type='P') v;

SET @VisitaId = @VisitaId + 35;

-- Carolina Ruiz (Rep 14) - Mendoza - 32 visitas
INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada)
SELECT
    @VisitaId + ROW_NUMBER() OVER (ORDER BY v.seq) - 1,
    (58 + (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) % 4), -- Médicos 58-61 (Mendoza)
    14, -- Carolina Ruiz
    DATEADD(DAY,
        CASE
            WHEN ROW_NUMBER() OVER (ORDER BY v.seq) <= 8 THEN (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) * 5 + 4
            WHEN ROW_NUMBER() OVER (ORDER BY v.seq) <= 16 THEN (ROW_NUMBER() OVER (ORDER BY v.seq) - 9) * 5 + 39
            WHEN ROW_NUMBER() OVER (ORDER BY v.seq) <= 24 THEN (ROW_NUMBER() OVER (ORDER BY v.seq) - 17) * 5 + 74
            ELSE (ROW_NUMBER() OVER (ORDER BY v.seq) - 25) * 5 + 109
        END,
        @FechaBase
    ),
    30 + (ROW_NUMBER() OVER (ORDER BY v.seq) % 4) * 5,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 11 = 0 THEN 'Virtual' ELSE 'Presencial' END,
    'Visita médica Mendoza',
    '[1,2,5]',
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 11 = 0 THEN 0 ELSE 1 END,
    '["Material promocional"]',
    'Visita Mendoza exitosa.',
    1,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) > 24 THEN NULL ELSE DATEADD(DAY, 30, DATEADD(DAY, (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) * 5, @FechaBase)) END
FROM (SELECT TOP 32 number as seq FROM master..spt_values WHERE type='P') v;

SET @VisitaId = @VisitaId + 32;

-- Completamos con visitas de otros representantes de forma similar...
-- Laura Rodríguez (Rep 6) - Santa Fe - 28 visitas
INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada)
SELECT
    @VisitaId + ROW_NUMBER() OVER (ORDER BY v.seq) - 1,
    (22 + (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) % 4), -- Médicos 22-25 (Santa Fe)
    6, -- Laura Rodríguez
    DATEADD(DAY, (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) * 6 + 5, @FechaBase),
    25 + (ROW_NUMBER() OVER (ORDER BY v.seq) % 6) * 5,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 9 = 0 THEN 'Virtual' ELSE 'Presencial' END,
    'Visita Santa Fe',
    '[1,4,6]',
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 9 = 0 THEN 0 ELSE 1 END,
    '["Material"]',
    'Visita Santa Fe.',
    1,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) > 21 THEN NULL ELSE DATEADD(DAY, 35, DATEADD(DAY, (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) * 6, @FechaBase)) END
FROM (SELECT TOP 28 number as seq FROM master..spt_values WHERE type='P') v;

SET @VisitaId = @VisitaId + 28;

-- Diego Pérez (Rep 7) - Rosario - 36 visitas
INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada)
SELECT
    @VisitaId + ROW_NUMBER() OVER (ORDER BY v.seq) - 1,
    (26 + (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) % 5), -- Médicos 26-30 (Rosario)
    7, -- Diego Pérez
    DATEADD(DAY, (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) * 5 + 3, @FechaBase),
    30 + (ROW_NUMBER() OVER (ORDER BY v.seq) % 5) * 5,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 10 = 0 THEN 'Virtual' WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 12 = 0 THEN 'Grupal' ELSE 'Presencial' END,
    'Visita Rosario',
    '[1,2,3]',
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 10 = 0 THEN 0 ELSE 1 END,
    '["Material"]',
    'Visita Rosario.',
    1,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) > 28 THEN NULL ELSE DATEADD(DAY, 30, DATEADD(DAY, (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) * 5, @FechaBase)) END
FROM (SELECT TOP 36 number as seq FROM master..spt_values WHERE type='P') v;

SET @VisitaId = @VisitaId + 36;

-- Martín Gómez (Rep 9) - CABA Sur - 38 visitas
INSERT INTO analytics_visitas (Id, MedicoId, RepresentanteId, FechaVisita, DuracionMinutos, TipoVisita, ObjetivoVisita, ProductosPromovidos, MuestrasMedicasEntregadas, MaterialEntregado, Notas, Exitosa, ProximaVisitaPlaneada)
SELECT
    @VisitaId + ROW_NUMBER() OVER (ORDER BY v.seq) - 1,
    (37 + (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) % 5), -- Médicos 37-41 (CABA Sur)
    9, -- Martín Gómez
    DATEADD(DAY, (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) * 5 + 2, @FechaBase),
    30 + (ROW_NUMBER() OVER (ORDER BY v.seq) % 5) * 5,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 11 = 0 THEN 'Virtual' WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 13 = 0 THEN 'Grupal' ELSE 'Presencial' END,
    'Visita CABA Sur',
    '[1,2,4]',
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) % 11 = 0 THEN 0 ELSE 1 END,
    '["Material"]',
    'Visita CABA Sur.',
    1,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY v.seq) > 30 THEN NULL ELSE DATEADD(DAY, 30, DATEADD(DAY, (ROW_NUMBER() OVER (ORDER BY v.seq) - 1) * 5, @FechaBase)) END
FROM (SELECT TOP 38 number as seq FROM master..spt_values WHERE type='P') v;

SET @VisitaId = @VisitaId + 38;

SET IDENTITY_INSERT analytics_visitas OFF;
GO

PRINT 'Total visitas insertadas: ' + CAST(@VisitaId - 1 AS VARCHAR);
GO

-- ==================== OBJETIVOS ====================
-- Definimos objetivos mensuales para los últimos 6 meses

SET IDENTITY_INSERT analytics_objetivos ON;

DECLARE @PeriodoBase DATE = CAST(DATEADD(MONTH, -6, GETDATE()) AS DATE);
DECLARE @ObjetivoId INT = 1;

-- Generamos objetivos para cada representante, cada mes, 3 tipos de objetivos
INSERT INTO analytics_objetivos (Id, RepresentanteId, Periodo, TipoObjetivo, Meta, Alcanzado)
SELECT
    ROW_NUMBER() OVER (ORDER BY r.Id, m.MonthOffset, o.TipoObjetivo),
    r.Id,
    FORMAT(DATEADD(MONTH, m.MonthOffset, @PeriodoBase), 'yyyy-MM'),
    o.TipoObjetivo,
    o.Meta,
    CAST(o.Meta * (0.65 + RAND(CHECKSUM(NEWID())) * 0.45) AS INT) -- Entre 65% y 110% de cumplimiento
FROM
    analytics_representantes r
CROSS JOIN
    (SELECT 0 AS MonthOffset UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) m
CROSS JOIN
    (
        SELECT 'Visitas' AS TipoObjetivo,
               CASE
                   WHEN r2.Id IN (1,2,3) THEN 25 -- Norte: menor objetivo
                   WHEN r2.Id IN (4,5,6,7) THEN 30 -- Centro: objetivo medio
                   WHEN r2.Id IN (8,9,10,11,12) THEN 35 -- AMBA: mayor objetivo
                   ELSE 20 -- Sur: objetivo menor
               END AS Meta
        FROM analytics_representantes r2
        WHERE r2.Id = r.Id

        UNION ALL

        SELECT 'Cobertura' AS TipoObjetivo,
               CASE
                   WHEN r2.Id IN (1,2,3) THEN 80 -- % de médicos asignados visitados
                   WHEN r2.Id IN (4,5,6,7) THEN 85
                   WHEN r2.Id IN (8,9,10,11,12) THEN 90
                   ELSE 75
               END AS Meta
        FROM analytics_representantes r2
        WHERE r2.Id = r.Id

        UNION ALL

        SELECT 'Frecuencia' AS TipoObjetivo,
               4 AS Meta -- Mínimo 4 visitas por médico en el período
        FROM analytics_representantes r2
        WHERE r2.Id = r.Id
    ) o;

SET IDENTITY_INSERT analytics_objetivos OFF;
GO

PRINT 'Objetivos insertados para 15 representantes x 6 meses x 3 tipos = 270 objetivos';
GO

PRINT '========================================';
PRINT 'DATOS DEMO INSERTADOS EXITOSAMENTE';
PRINT '========================================';
PRINT 'Total Médicos: 64';
PRINT 'Total Representantes: 15';
PRINT 'Total Productos: 10';
PRINT 'Total Visitas: ~323';
PRINT 'Total Objetivos: 270';
PRINT '========================================';
GO
