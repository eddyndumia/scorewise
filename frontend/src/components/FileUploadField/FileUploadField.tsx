import { useId, useRef } from 'react';
import styles from './FileUploadField.module.css';

interface FileUploadFieldProps {
  fileName: string | null;
  onFileSelect: (file: File | null) => void;
}

export function FileUploadField({ fileName, onFileSelect }: FileUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div
        className={`${styles.dropzone} ${fileName ? styles.hasFile : ''}`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        {fileName ? (
          <p className={styles.fileName}>{fileName}</p>
        ) : (
          <p className={styles.dropzoneText}>Tap to upload your M-Pesa statement (PDF)</p>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="application/pdf"
          className={styles.hiddenInput}
          onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
        />
      </div>
      <p className={styles.note}>Your statement is processed to compute your score and then discarded — it is never stored.</p>
    </div>
  );
}
