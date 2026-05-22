import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function RichTextEditor({ content, onChange, placeholder = 'Tulis naskah dinas di sini...' }) {
  const editorRef = useRef(null);

  const handleEditorChange = (newContent, editor) => {
    onChange(newContent);
  };

  return (
    <div style={{
      border: '1px solid var(--slate-200)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      background: 'white',
      minHeight: '400px'
    }}>
      <Editor
        apiKey="ern0cy0zzrd7z1v1xf7y0glwofutjfdq8ptz9z7y9btlv2rk"
        onInit={(evt, editor) => editorRef.current = editor}
        value={content || ''}
        onEditorChange={handleEditorChange}
        init={{
          height: 600,
          menubar: 'file edit view insert format tools table help',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'table link image | removeformat | help',
          content_style: 'body { font-family:"Times New Roman",Times,serif; font-size:12pt; line-height:1.6; padding: 20px; }',
          placeholder: placeholder,
          branding: false,
          promotion: false,
          language: 'id', // Opsional jika TinyMCE mendukung ID, default EN
          skin: 'oxide',
          content_css: 'default'
        }}
      />
    </div>
  );
}
