import React, { useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';

export default function RichTextEditor({ content, onChange, placeholder = 'Tulis naskah dinas di sini...' }) {
  const editorRef = useRef(null);

  const config = useMemo(() => ({
    // ===== TAMPILAN =====
    height: 680,
    minHeight: 400,
    theme: 'default',
    language: 'id',
    direction: 'ltr',

    // Tampilan seperti halaman Word (A4)
    width: '100%',

    // ===== FITUR PASTE FROM WORD (Built-in Jodit) =====
    // Jodit sudah handle Word paste secara otomatis
    processPasteHTML: true,
    processPasteFromWord: true,      // Deteksi dan bersihkan konten Word
    askBeforePasteHTML: false,       // Langsung paste, jangan tanya dulu
    askBeforePasteFromWord: false,   // Langsung paste dari Word tanpa popup

    // Bersihkan style Word yang berlebihan tapi pertahankan formatting penting
    beautifyHTML: true,
    cleanHTML: {
      fillEmptyParagraph: false,
      replaceNBSP: false,          // Jaga &nbsp; agar spacing tidak rusak
      removeEmptyElements: false,
      allowTags: false,
      denyTags: false,
    },

    // ===== FONT & STYLE KONTEN (seperti Word) =====
    style: {
      font: '12pt "Times New Roman", Times, serif',
    },

    // Inject CSS ke dalam konten editor agar tampilan seperti Word
    editorCssClass: 'jodit-surat-editor',
    extraCss: `
      .jodit-wysiwyg {
        font-family: "Times New Roman", Times, serif !important;
        font-size: 12pt !important;
        line-height: 1.6 !important;
        color: #000 !important;
        padding: 40px 50px !important;
        background: white !important;
        min-height: 500px;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.1) inset;
      }
      .jodit-wysiwyg table {
        border-collapse: collapse;
      }
      .jodit-wysiwyg td, .jodit-wysiwyg th {
        padding: 2px 6px;
      }
      .jodit-wysiwyg p {
        margin: 0 0 4px 0;
      }
    `,

    // ===== TOOLBAR (mirip Word) =====
    toolbar: true,
    toolbarSticky: true,
    toolbarStickyOffset: 0,

    buttons: [
      'source',
      '|',
      'undo', 'redo',
      '|',
      'bold', 'italic', 'underline', 'strikethrough',
      '|',
      'superscript', 'subscript',
      '|',
      'brush',                     // Highlight warna
      'font', 'fontsize',
      '|',
      'paragraph',                  // Heading / Normal Text
      '|',
      'align',
      '|',
      'ul', 'ol',
      'outdent', 'indent',
      '|',
      'table',
      'link',
      '|',
      'image',
      '|',
      'hr',
      'eraser',                    // Clear formatting (seperti "Hapus Format")
      '|',
      'copyformat',
      '|',
      'print',
      'fullsize',
    ],

    // ===== FONT OPTIONS (seperti Word) =====
    fontValues: {
      'Times New Roman': '"Times New Roman", Times, serif',
      'Arial': 'Arial, Helvetica, sans-serif',
      'Calibri': 'Calibri, sans-serif',
      'Georgia': 'Georgia, serif',
      'Verdana': 'Verdana, Geneva, sans-serif',
      'Tahoma': 'Tahoma, Geneva, sans-serif',
      'Courier New': '"Courier New", Courier, monospace',
    },

    // ===== UKURAN FONT (pt) =====
    fontsizeValues: [
      '8', '9', '10', '11', '12', '13', '14', '16',
      '18', '20', '22', '24', '26', '28', '36', '48', '72'
    ],

    // ===== PLACEHOLDER =====
    placeholder: placeholder,

    // ===== PERFORMANCE =====
    enableDragAndDropFileToEditor: true,
    uploader: {
      insertImageAsBase64URI: true,   // Upload gambar langsung sebagai base64
    },

    // ===== STATUS BAR =====
    showWordsCounter: true,
    showCharsCounter: true,

    // ===== DISABLE FITUR TIDAK PERLU =====
    showXPathInStatusbar: false,
    disablePlugins: ['speech-recognize'],

    // ===== READONLY =====
    readonly: false,
  }), [placeholder]);

  return (
    <div className="jodit-wrapper" style={{
      border: '1px solid var(--slate-200)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      background: 'white',
    }}>
      <JoditEditor
        ref={editorRef}
        value={content || ''}
        config={config}
        onChange={onChange}
      />
      <div style={{
        padding: '8px 12px',
        background: '#f0fdf4',
        borderTop: '1px solid #bbf7d0',
        fontSize: '12px',
        color: '#166534',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>
          <strong>Paste from Word aktif:</strong> Copy-paste dari Microsoft Word atau Google Docs otomatis dibersihkan.
          Format tabel, bold, italic, dan underline dipertahankan.
        </span>
      </div>
    </div>
  );
}
