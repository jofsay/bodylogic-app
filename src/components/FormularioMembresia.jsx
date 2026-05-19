import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function FormularioMembresia() {
  const estadoInicial = {
    apellidoPaterno: "",
    apellidoMaterno: "",
    nombres: "",
    razonSocial: "",
    fechaNacimiento: "",
    lugarNacimiento: "",
    genero: "",

    calle: "",
    numeroCasa: "",
    colonia: "",
    municipio: "",
    estado: "",
    pais: "México",
    telefono: "",
    telefonoCelular: "",
    correo: "",

    tipoBeneficiario: "Beneficiario",
    beneficiarioApellidoPaterno: "",
    beneficiarioApellidoMaterno: "",
    beneficiarioNombres: "",
    beneficiarioRelacion: "",
    beneficiarioDomicilio: "",
    beneficiarioTelefono: "",

    patrocinadorApellidoPaterno: "",
    patrocinadorApellidoMaterno: "",
    patrocinadorNombres: "",
    numeroPatrocinador: "",

    lugarFirma: "",
    fechaFirma: "",

    curp: "",
    rfc: "",
    observaciones: "",
    aceptaPrivacidad: false,
    confirmaMayorEdad: false,
  };

  const [formulario, setFormulario] = useState(estadoInicial);

  const cambiarCampo = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const limpiarFormulario = () => {
    setFormulario(estadoInicial);
  };

  const dividirFecha = (fechaISO) => {
    if (!fechaISO) return { dd: "", mm: "", aaaa: "" };
    const partes = fechaISO.split("-");
    if (partes.length !== 3) return { dd: "", mm: "", aaaa: "" };
    return {
      aaaa: partes[0],
      mm: partes[1],
      dd: partes[2],
    };
  };

  const generarPDFRelleno = async () => {
    try {
      const url = "/archivos/SOLICITUD-DE-MEMBRESIA.pdf";
      const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pages = pdfDoc.getPages();
      const primeraPagina = pages[0];
      const colorTexto = rgb(0, 0, 0);

      const escribir = ({
        texto = "",
        x,
        y,
        width = 100,
        size = 8.5,
        bold = false,
      }) => {
        if (!texto) return;

        const limpio = String(texto).replace(/\s+/g, " ").trim();

        primeraPagina.drawText(limpio, {
          x,
          y,
          maxWidth: width,
          size,
          font: bold ? fontBold : font,
          color: colorTexto,
          lineHeight: size + 1,
        });
      };

      const nombreSolicitante =
        `${formulario.apellidoPaterno} ${formulario.apellidoMaterno} ${formulario.nombres}`.trim();

      const nombreBeneficiario =
        `${formulario.beneficiarioApellidoPaterno} ${formulario.beneficiarioApellidoMaterno} ${formulario.beneficiarioNombres}`.trim();

      const nombrePatrocinador =
        `${formulario.patrocinadorApellidoPaterno} ${formulario.patrocinadorApellidoMaterno} ${formulario.patrocinadorNombres}`.trim();

      const { dd, mm, aaaa } = dividirFecha(formulario.fechaNacimiento);
      const { dd: ddFirma, mm: mmFirma, aaaa: aaaaFirma } = dividirFecha(formulario.fechaFirma);
      const fechaFirmaTexto = [ddFirma, mmFirma, aaaaFirma].filter(Boolean).join("/");

      escribir({ texto: nombreSolicitante, x: 31.8, y: 644.5, width: 545, size: 8.7 });
      escribir({ texto: formulario.razonSocial, x: 31.8, y: 590.5, width: 252, size: 8.5 });
      escribir({ texto: dd, x: 329.5, y: 590.5, width: 12, size: 8.5 });
      escribir({ texto: mm, x: 360.5, y: 590.5, width: 12, size: 8.5 });
      escribir({ texto: aaaa, x: 389.5, y: 590.5, width: 26, size: 8.5 });
      escribir({ texto: formulario.lugarNacimiento, x: 428.8, y: 590.5, width: 117, size: 8.5 });
      escribir({ texto: formulario.calle, x: 31.8, y: 547.7, width: 431, size: 8.5 });
      escribir({ texto: formulario.numeroCasa, x: 472, y: 547.7, width: 102, size: 8.5 });
      escribir({ texto: formulario.colonia, x: 31.8, y: 509.6, width: 247, size: 8.5 });
      escribir({ texto: formulario.telefono, x: 327, y: 509.6, width: 110, size: 8.5 });
      escribir({ texto: formulario.telefonoCelular, x: 462.2, y: 509.6, width: 112, size: 8.5 });
      escribir({ texto: formulario.municipio, x: 31.8, y: 468, width: 102, size: 8.5 });
      escribir({ texto: formulario.estado, x: 134, y: 468, width: 100, size: 8.5 });
      escribir({ texto: formulario.pais, x: 229.6, y: 468, width: 71, size: 8.5 });
      escribir({ texto: formulario.correo, x: 327, y: 468, width: 248, size: 8.2 });

      escribir({ texto: formulario.beneficiarioRelacion, x: 417, y: 394.6, width: 156, size: 8.5 });
      escribir({ texto: nombreBeneficiario, x: 31.8, y: 362.1, width: 545, size: 8.7 });
      escribir({ texto: formulario.beneficiarioDomicilio, x: 31.8, y: 331.0, width: 401, size: 8.2 });
      escribir({ texto: formulario.beneficiarioTelefono, x: 450.4, y: 331.0, width: 125, size: 8.5 });

      escribir({ texto: nombrePatrocinador, x: 33.2, y: 242.1, width: 362, size: 8.7 });
      escribir({ texto: formulario.numeroPatrocinador, x: 409.7, y: 242.1, width: 165, size: 8.5 });

      escribir({ texto: formulario.lugarFirma, x: 331.9, y: 70.2, width: 115, size: 8.5 });
      escribir({ texto: fechaFirmaTexto, x: 516, y: 70.2, width: 54, size: 8.5 });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      const enlace = document.createElement("a");
      enlace.href = blobUrl;
      enlace.download = "Solicitud-de-Membresia-Rellena.pdf";
      enlace.click();

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Hubo un problema al generar el PDF. Revisa la consola.");
    }
  };

  const nombreSolicitanteCompleto =
    `${formulario.apellidoPaterno} ${formulario.apellidoMaterno} ${formulario.nombres}`.trim();

  const nombreBeneficiarioCompleto =
    `${formulario.beneficiarioApellidoPaterno} ${formulario.beneficiarioApellidoMaterno} ${formulario.beneficiarioNombres}`.trim();

  const nombrePatrocinadorCompleto =
    `${formulario.patrocinadorApellidoPaterno} ${formulario.patrocinadorApellidoMaterno} ${formulario.patrocinadorNombres}`.trim();

  const direccionCompleta = [
    formulario.calle,
    formulario.numeroCasa ? `No. ${formulario.numeroCasa}` : "",
    formulario.colonia,
    formulario.municipio,
    formulario.estado,
    formulario.pais,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        borderRadius: "14px",
        backgroundColor: "#f8fafc",
        border: "1px solid #cbd5e1",
      }}
    >
      <h2 style={{ marginTop: 0, color: "#0f172a" }}>
        Solicitud de Membresía Digital
      </h2>

      <p style={{ color: "#475569", lineHeight: "1.6" }}>
        Esta versión web captura la información y rellena únicamente los campos reales del frente del formato.
      </p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        <button onClick={generarPDFRelleno} style={botonExito}>
          Generar PDF relleno
        </button>

        <button onClick={limpiarFormulario} style={botonSecundario}>
          Limpiar formulario
        </button>
      </div>

      <Seccion titulo="Datos del solicitante">
        <div style={gridCampos}>
          <Campo label="Apellido paterno" name="apellidoPaterno" value={formulario.apellidoPaterno} onChange={cambiarCampo} />
          <Campo label="Apellido materno" name="apellidoMaterno" value={formulario.apellidoMaterno} onChange={cambiarCampo} />
          <Campo label="Nombre(s)" name="nombres" value={formulario.nombres} onChange={cambiarCampo} />
          <Campo label="Razón Social / Denominación" name="razonSocial" value={formulario.razonSocial} onChange={cambiarCampo} />
          <Campo label="Fecha de nacimiento" name="fechaNacimiento" type="date" value={formulario.fechaNacimiento} onChange={cambiarCampo} />
          <Campo label="Lugar de nacimiento" name="lugarNacimiento" value={formulario.lugarNacimiento} onChange={cambiarCampo} />
          <SelectCampo
            label="Género"
            name="genero"
            value={formulario.genero}
            onChange={cambiarCampo}
            opciones={[
              { value: "", label: "Selecciona" },
              { value: "F", label: "Femenino" },
              { value: "M", label: "Masculino" },
            ]}
          />
          <Campo label="Calle" name="calle" value={formulario.calle} onChange={cambiarCampo} />
          <Campo label="No. casa" name="numeroCasa" value={formulario.numeroCasa} onChange={cambiarCampo} />
          <Campo label="Colonia" name="colonia" value={formulario.colonia} onChange={cambiarCampo} />
          <Campo label="Municipio" name="municipio" value={formulario.municipio} onChange={cambiarCampo} />
          <Campo label="Estado" name="estado" value={formulario.estado} onChange={cambiarCampo} />
          <Campo label="País" name="pais" value={formulario.pais} onChange={cambiarCampo} />
          <Campo label="Teléfono" name="telefono" value={formulario.telefono} onChange={cambiarCampo} />
          <Campo label="Teléfono celular" name="telefonoCelular" value={formulario.telefonoCelular} onChange={cambiarCampo} />
          <Campo label="Correo electrónico" name="correo" type="email" value={formulario.correo} onChange={cambiarCampo} />
        </div>
      </Seccion>

      <Seccion titulo="Datos del Beneficiario o Codistribuidor">
        <div style={gridCampos}>
          <SelectCampo
            label="Marca una opción"
            name="tipoBeneficiario"
            value={formulario.tipoBeneficiario}
            onChange={cambiarCampo}
            opciones={[
              { value: "Beneficiario", label: "Beneficiario" },
              { value: "Codistribuidor", label: "Codistribuidor" },
            ]}
          />
          <Campo label="Apellido paterno" name="beneficiarioApellidoPaterno" value={formulario.beneficiarioApellidoPaterno} onChange={cambiarCampo} />
          <Campo label="Apellido materno" name="beneficiarioApellidoMaterno" value={formulario.beneficiarioApellidoMaterno} onChange={cambiarCampo} />
          <Campo label="Nombre(s)" name="beneficiarioNombres" value={formulario.beneficiarioNombres} onChange={cambiarCampo} />
          <Campo label="Relación o parentesco" name="beneficiarioRelacion" value={formulario.beneficiarioRelacion} onChange={cambiarCampo} />
          <Campo label="Teléfono" name="beneficiarioTelefono" value={formulario.beneficiarioTelefono} onChange={cambiarCampo} />
        </div>

        <div style={{ marginTop: "16px" }}>
          <label style={labelEstilo}>Domicilio</label>
          <textarea
            name="beneficiarioDomicilio"
            value={formulario.beneficiarioDomicilio}
            onChange={cambiarCampo}
            rows="3"
            style={textareaEstilo}
          />
        </div>
      </Seccion>

      <Seccion titulo="Datos del Patrocinador">
        <div style={gridCampos}>
          <Campo label="Apellido paterno" name="patrocinadorApellidoPaterno" value={formulario.patrocinadorApellidoPaterno} onChange={cambiarCampo} />
          <Campo label="Apellido materno" name="patrocinadorApellidoMaterno" value={formulario.patrocinadorApellidoMaterno} onChange={cambiarCampo} />
          <Campo label="Nombre(s)" name="patrocinadorNombres" value={formulario.patrocinadorNombres} onChange={cambiarCampo} />
          <Campo label="Número de membresía del patrocinador" name="numeroPatrocinador" value={formulario.numeroPatrocinador} onChange={cambiarCampo} />
        </div>
      </Seccion>

      <Seccion titulo="Cierre del documento">
        <div style={gridCampos}>
          <Campo label="Lugar" name="lugarFirma" value={formulario.lugarFirma} onChange={cambiarCampo} />
          <Campo label="Fecha" name="fechaFirma" type="date" value={formulario.fechaFirma} onChange={cambiarCampo} />
        </div>
      </Seccion>
    </div>
  );
}

function Seccion({ titulo, children }) {
  return (
    <div style={seccionEstilo}>
      <h3 style={{ marginTop: 0, color: "#1e293b" }}>{titulo}</h3>
      {children}
    </div>
  );
}

function Campo({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={labelEstilo}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        style={inputEstilo}
      />
    </div>
  );
}

function SelectCampo({ label, name, value, onChange, opciones }) {
  return (
    <div>
      <label style={labelEstilo}>{label}</label>
      <select name={name} value={value} onChange={onChange} style={inputEstilo}>
        {opciones.map((opcion) => (
          <option key={opcion.value} value={opcion.value}>
            {opcion.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const seccionEstilo = {
  marginTop: "20px",
  padding: "16px",
  borderRadius: "18px",
  backgroundColor: "#ffffff",
  border: "1px solid #fde2cc",
  boxShadow: "0 10px 24px rgba(124,45,18,0.05)",
};

const gridCampos = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "16px",
};

const labelEstilo = {
  display: "block",
  marginBottom: "6px",
  fontWeight: "bold",
  color: "#7c2d12",
};

const inputEstilo = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #d6d3d1",
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
  color: "#111827",
  WebkitTextFillColor: "#111827",
  appearance: "none",
  WebkitAppearance: "none",
};

const textareaEstilo = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #d6d3d1",
  boxSizing: "border-box",
  resize: "vertical",
  backgroundColor: "#ffffff",
  color: "#111827",
  WebkitTextFillColor: "#111827",
  appearance: "none",
  WebkitAppearance: "none",
};

const botonExito = {
  padding: "10px 16px",
  borderRadius: "12px",
  border: "1px solid #15803d",
  backgroundColor: "#16a34a",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "bold",
};

const botonSecundario = {
  padding: "10px 16px",
  borderRadius: "12px",
  border: "1px solid #f3d2b7",
  backgroundColor: "#fffaf5",
  color: "#7c2d12",
  cursor: "pointer",
  fontWeight: "bold",
};

export default FormularioMembresia;