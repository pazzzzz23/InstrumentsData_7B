"use client";

import { upload } from "@vercel/blob/client";
import { ImagePlus, LoaderCircle, PackagePlus, Search, Wrench, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type Instrument = {
  id: number;
  uploaderName: string;
  instrumentName: string;
  partNumber: string;
  serialNumber: string;
  photoUrl: string;
  createdAt: string;
};

type FormValues = Omit<Instrument, "id" | "photoUrl" | "createdAt">;

const emptyForm: FormValues = { uploaderName: "", instrumentName: "", partNumber: "", serialNumber: "" };

export default function Home() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadInstruments() {
    try {
      const response = await fetch("/api/instruments", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo conectar con la base de datos.");
      setInstruments(data.instruments);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInstruments();
  }, []);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");
    setNotice("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen.");
      return;
    }
    if (file.size > 5_000_000) {
      setError("La foto debe pesar menos de 5 MB.");
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(null);
    setPreview("");
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) {
      setError("Agrega una foto del instrumento para continuar.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const blob = await upload(photo.name, photo, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      const response = await fetch("/api/instruments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, photoUrl: blob.url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo guardar el instrumento.");
      setInstruments((current) => [data.instrument, ...current]);
      setValues(emptyForm);
      clearPhoto();
      setNotice("Instrumento registrado correctamente.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el instrumento.");
    } finally {
      setSaving(false);
    }
  }

  const visibleInstruments = instruments.filter((instrument) =>
    [instrument.instrumentName, instrument.partNumber, instrument.serialNumber, instrument.uploaderName]
      .join(" ").toLocaleLowerCase("es").includes(filter.toLocaleLowerCase("es")),
  );

  return (
    <main className="workspace">
      <aside className="rail" aria-label="Navegación principal">
        <div className="brand-mark"><Wrench size={21} strokeWidth={2.2} /></div>
        <span className="rail-caption">PAZ</span>
        <div className="rail-rule" />
        <div className="rail-active" aria-label="Inventario"><PackagePlus size={19} /></div>
        <span className="rail-bottom">ID</span>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="wordmark"><span>PAZ</span><span className="wordmark-light">INSTRUMENTS</span></div>
          <div className="topbar-right"><span className="status-dot" /><span>REGISTRO DE EQUIPOS</span></div>
        </header>

        <section className="page-heading">
          <div>
            <p className="eyebrow">CONTROL DE ACTIVOS <span> / </span> 01</p>
            <h1>Inventario de <em>instrumentos</em></h1>
            <p className="subheading">Registro técnico y trazabilidad de equipos.</p>
          </div>
          <div className="asset-count"><strong>{String(instruments.length).padStart(2, "0")}</strong><span>REGISTROS<br />TOTALES</span></div>
        </section>

        <div className="content-grid">
          <section className="entry-panel" aria-labelledby="entry-title">
            <div className="panel-heading">
              <div className="panel-index">01</div>
              <div><p className="eyebrow">NUEVA ENTRADA</p><h2 id="entry-title">Registrar equipo</h2></div>
            </div>
            <form onSubmit={submitForm}>
              <label className="field-label" htmlFor="uploaderName">Persona que carga el dato</label>
              <input id="uploaderName" autoComplete="name" placeholder="Nombre y apellido" value={values.uploaderName} onChange={(event) => setValues({ ...values, uploaderName: event.target.value })} required />

              <label className="field-label" htmlFor="instrumentName">Nombre del instrumento</label>
              <input id="instrumentName" placeholder="Ej. Multímetro digital" value={values.instrumentName} onChange={(event) => setValues({ ...values, instrumentName: event.target.value })} required />

              <div className="field-row">
                <div><label className="field-label" htmlFor="partNumber">Nro. de parte</label><input id="partNumber" placeholder="P/N" value={values.partNumber} onChange={(event) => setValues({ ...values, partNumber: event.target.value })} required /></div>
                <div><label className="field-label" htmlFor="serialNumber">Nro. de serie</label><input id="serialNumber" placeholder="S/N" value={values.serialNumber} onChange={(event) => setValues({ ...values, serialNumber: event.target.value })} required /></div>
              </div>

              <span className="field-label">Foto del instrumento</span>
              <label className={`photo-drop${preview ? " has-photo" : ""}`} htmlFor="photo">
                {preview ? <Image src={preview} alt="Vista previa del instrumento" fill sizes="(max-width: 700px) 100vw, 360px" unoptimized /> : <><ImagePlus size={23} strokeWidth={1.5} /><span>Seleccionar foto</span><small>JPG, PNG o WEBP · máximo 5 MB</small></>}
              </label>
              <input className="visually-hidden" id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} />
              {preview && <button className="remove-photo" type="button" onClick={clearPhoto}><X size={14} /> Quitar foto</button>}

              {error && <p className="message error-message" role="alert">{error}</p>}
              {notice && <p className="message success-message" role="status">{notice}</p>}
              <button className="submit-button" type="submit" disabled={saving}>
                {saving ? <LoaderCircle className="spin" size={17} /> : <PackagePlus size={17} />}
                {saving ? "Guardando registro..." : "Guardar instrumento"}
              </button>
            </form>
          </section>

          <section className="inventory-panel" aria-labelledby="inventory-title">
            <div className="inventory-header">
              <div className="panel-heading inventory-title-block">
                <div className="panel-index">02</div>
                <div><p className="eyebrow">BASE DE DATOS</p><h2 id="inventory-title">Instrumentos</h2></div>
              </div>
              <div className="search-box"><Search size={16} /><input aria-label="Buscar instrumentos" placeholder="Buscar equipo..." value={filter} onChange={(event) => setFilter(event.target.value)} /></div>
            </div>

            <div className="table-head"><span>EQUIPO / NÚMERO DE PARTE</span><span>NÚMERO DE SERIE</span><span>REGISTRADO POR</span></div>
            {loading ? <div className="empty-state"><LoaderCircle className="spin" size={22} /><span>Cargando inventario...</span></div> : visibleInstruments.length === 0 ? (
              <div className="empty-state"><div className="empty-icon"><PackagePlus size={21} /></div><strong>{error ? "Base de datos sin conexión" : filter ? "Sin coincidencias" : "Aún no hay instrumentos"}</strong><span>{error || (filter ? "Prueba con otro número o nombre." : "Los nuevos registros aparecerán aquí.")}</span></div>
            ) : <div className="instrument-list">{visibleInstruments.map((instrument, index) => (
              <article className="instrument-row" key={instrument.id}>
                <div className="row-main"><div className="row-number">{String(index + 1).padStart(2, "0")}</div><Image className="instrument-photo" src={instrument.photoUrl} alt={instrument.instrumentName} width={54} height={54} unoptimized /><div className="instrument-name"><strong>{instrument.instrumentName}</strong><span>P/N · {instrument.partNumber}</span></div></div>
                <div className="serial-value">{instrument.serialNumber}</div>
                <div className="uploader-value"><span className="avatar-initial">{instrument.uploaderName.trim().charAt(0).toUpperCase()}</span><span>{instrument.uploaderName}</span></div>
              </article>
            ))}</div>}
            <div className="inventory-foot"><span>MOSTRANDO {visibleInstruments.length} DE {instruments.length} REGISTROS</span><span>ORDEN · MÁS RECIENTES</span></div>
          </section>
        </div>

        <footer className="page-footer"><span>PAZ INSTRUMENTS <span className="footer-separator">/</span> CONTROL DE ACTIVOS</span><span>INVENTARIO DIGITAL</span></footer>
      </div>
    </main>
  );
}