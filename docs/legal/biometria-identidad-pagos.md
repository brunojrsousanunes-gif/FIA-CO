# FIA&CO — Biometría para verificación de identidad y pagos entre particulares

> Documento de diseño jurídico-técnico. No habilita tratamiento biométrico real. Antes de producción deberá realizarse una EIPD, validar base jurídica, necesidad, proporcionalidad, proveedores y arquitectura concreta.

## 1. Objetivo

FIA&CO podrá contemplar tres modalidades biométricas como factores de verificación:

- huella dactilar en dispositivos móviles o terminales compatibles;
- reconocimiento facial mediante cámara frontal;
- biometría de voz para canales telefónicos o de voz.

Su finalidad será reforzar la verificación de identidad y la autenticación de operaciones entre particulares, nunca sustituir por sí sola los requisitos legales aplicables a identidad, pago o contratación.

## 2. Principios obligatorios

La biometría se tratará como tecnología de alto riesgo y, cuando permita o confirme identificación única, como dato biométrico sujeto al artículo 9 RGPD. FIA&CO no activará almacenamiento centralizado de plantillas biométricas por defecto.

Reglas de diseño:

- minimización: recoger solo lo estrictamente necesario;
- privacidad por diseño y por defecto;
- alternativa no biométrica equivalente cuando jurídicamente sea necesaria para que la elección sea libre;
- separación entre verificación de identidad y autorización de una transacción;
- no reutilización de biometría para finalidades incompatibles;
- cifrado y aislamiento técnico de cualquier plantilla cuando deba existir;
- revocabilidad del vínculo entre plantilla e identidad;
- eliminación cuando desaparezca la finalidad;
- registro auditable de decisiones y versiones del sistema.

## 3. Arquitectura preferente

Para móvil, la opción preferente será autenticación biométrica local mediante las capacidades seguras del sistema operativo o estándar equivalente, de modo que FIA&CO reciba un resultado criptográfico de autenticación y no la huella o el rostro en bruto.

Para reconocimiento facial remoto o voz, si llegaran a utilizarse para identificar de forma unívoca, deberá justificarse expresamente su necesidad y proporcionalidad, limitarse a los casos aprobados en la EIPD y evitar guardar muestras brutas salvo necesidad legal/técnica acreditada.

## 4. Pagos entre particulares

La biometría podrá actuar como factor de inherencia dentro de autenticación reforzada cuando el proveedor de servicios de pago y la normativa aplicable lo permitan. No se considerará suficiente por sí sola: la arquitectura deberá preservar la independencia entre factores y, para pagos electrónicos remotos, respetar el vínculo dinámico con importe y beneficiario cuando resulte exigible.

FIA&CO no se convertirá por esta función en proveedor de servicios de pago. En producción, la ejecución financiera se delegará en proveedores autorizados, usando FIA&CO la biometría solo dentro del flujo admitido por dichos proveedores y por la legislación.

## 5. Casos de uso

### A. Verificación de identidad
- alta o recuperación reforzada de cuenta;
- confirmación de identidad antes de actos jurídicos sensibles;
- reautenticación ante cambios de riesgo.

### B. Pago entre particulares
- confirmación de que quien autoriza es el titular autenticado;
- segundo control antes de enviar una orden al proveedor de pago;
- incremento de seguridad para operaciones anómalas o de mayor riesgo.

### C. Operaciones telefónicas
- biometría de voz solo cuando exista base jurídica válida, evaluación de riesgo y alternativa adecuada;
- no se reutilizará la voz capturada para otros fines incompatibles.

## 6. Controles previos a producción

Antes de activar biometría real FIA&CO deberá:

1. realizar EIPD;
2. acreditar idoneidad, necesidad y proporcionalidad;
3. documentar la base jurídica y, cuando proceda, la excepción del art. 9.2 RGPD;
4. ofrecer alternativa no biométrica cuando la validez del consentimiento o la proporcionalidad lo exijan;
5. validar tasas de falso positivo/falso negativo y mecanismos anti-spoofing;
6. evitar decisiones automáticas irreversibles basadas únicamente en biometría;
7. aplicar cifrado, control de acceso, segregación y retención mínima;
8. definir revocación, borrado, incidentes y recuperación segura;
9. verificar que el proveedor de pagos cumple autenticación reforzada y demás requisitos sectoriales.

## 7. Estado en el MVP

En el Paso 2 solo se mostrará como capacidad futura o simulada. No se solicitarán huellas, imágenes faciales, grabaciones de voz ni plantillas biométricas reales desde la demo pública.

## 8. Fuentes regulatorias de referencia

- RGPD, arts. 4.14, 9, 25, 32 y 35.
- AEPD: criterios sobre tratamientos biométricos, alto riesgo, minimización y EIPD.
- PSD2, art. 97, y Reglamento Delegado (UE) 2018/389 sobre autenticación reforzada, inherencia e independencia de factores.
