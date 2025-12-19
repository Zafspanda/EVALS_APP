import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from './Button';
import IconButton from './IconButton';
import ListItem, { ListItemText, ListItemIcon } from './ListItem';
import List from './List';
import FormElement, { Label } from './FormElement';
import TypeBlock from './TypeBlock';
import UploadIcon from '../icons/UploadIcon';
import TrashIcon from '../icons/TrashIcon';
import LoadingIcon from '../icons/LoadingIcon';
import CircleCheckFilledIcon from '../icons/CircleCheckFilledIcon';
import CircleCrossFilledIcon from '../icons/CircleCrossFilledIcon';
import { ColorBaseGreenDefault, ColorBaseRedDefault } from '../tokens';

const UPLOADING = 'uploading';
const SUCCESS = 'success';
const ERROR = 'error';
const PENDING = 'pending';

const FileUpload = ({
  id,
  name,
  label,
  hint,
  error,
  files: currentFiles = [],
  accept,
  multiple = true,
  maxFiles,
  maxFileSize,
  disabled,
  required,
  onFilesChange,
  onFileUpload,
  className,
  title = 'Upload files',
  dragText = 'Drag and drop files here, or',
  browseText = 'browse files',
  ...props
}) => {
  const [files, setFiles] = useState(currentFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback(
    (selectedFiles) => {
      const fileArray = Array.from(selectedFiles);

      // Validate file count
      if (maxFiles && files.length + fileArray.length > maxFiles) {
        return;
      }

      // Validate file size
      if (maxFileSize) {
        const oversizedFiles = fileArray.filter(
          (file) => file.size > maxFileSize
        );
        if (oversizedFiles.length > 0) {
          return;
        }
      }

      const newFiles = fileArray.map((file) => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        status: PENDING, // pending, uploading, success, error
        progress: 0,
        error,
      }));

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);

      if (onFilesChange) {
        onFilesChange(updatedFiles);
      }

      // Auto-start upload if handler provided
      if (onFileUpload) {
        newFiles.forEach((fileItem) => {
          uploadFile(fileItem);
        });
      }
    },
    [files, maxFiles, maxFileSize, onFilesChange, onFileUpload]
  );

  const uploadFile = async (fileItem) => {
    // Update status to uploading
    setFiles((prev) =>
      prev.map((f) => (f.id === fileItem.id ? { ...f, status: UPLOADING } : f))
    );

    try {
      if (onFileUpload) {
        await onFileUpload(fileItem.file, (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === fileItem.id ? { ...f, progress } : f))
          );
        });
      }

      // Update status to success
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: SUCCESS, progress: 100 } : f
        )
      );
    } catch (error) {
      // Update status to error
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: ERROR, error: error.message }
            : f
        )
      );
    }
  };

  const removeFile = (fileId) => {
    const updatedFiles = files.filter((f) => f.id !== fileId);
    setFiles(updatedFiles);

    if (onFilesChange) {
      onFilesChange(updatedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!disabled) {
      const droppedFiles = e.dataTransfer.files;
      handleFileSelect(droppedFiles);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case PENDING:
      case UPLOADING:
        return (
          <LoadingIcon className="sds-file-upload__icon sds-file-upload__icon--loading" />
        );
      case SUCCESS:
        return (
          <CircleCheckFilledIcon
            width={24}
            height={24}
            color={ColorBaseGreenDefault}
          />
        );
      case ERROR:
        return (
          <CircleCrossFilledIcon
            width={24}
            height={24}
            color={ColorBaseRedDefault}
          />
        );
      default:
        return;
    }
  };

  const getStatusText = (status, error) => {
    switch (status) {
      case UPLOADING:
        return 'Uploading...';
      case SUCCESS:
        return (
          <div className="sds-file-upload__secondary-text--uploaded">
            Uploaded
          </div>
        );
      case ERROR:
        return (
          <div className="sds-file-upload__secondary-text--failed">
            {error || 'Upload failed'}
          </div>
        );
      default:
        return;
    }
  };

  const dropzoneClasses = classNames(
    'sds-file-upload__dropzone',
    isDragOver && 'sds-file-upload__dropzone--drag-over',
    disabled && 'sds-file-upload__dropzone--disabled'
  );

  const componentClasses = classNames('sds-file-upload', className);

  return (
    <FormElement className={componentClasses}>
      <>
        {label && <Label as="div">{label}</Label>}

        <div
          className={dropzoneClasses}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="sds-file-upload__content">
            <UploadIcon
              className="sds-file-upload__icon"
              width={23}
              height={18}
            />
            <div className="sds-file-upload__text">
              <TypeBlock primaryText={title} secondaryText={dragText} />
              <Button
                variant="secondary"
                onClick={handleButtonClick}
                disabled={disabled}
                type="button"
                className="sds-file-upload__browse-button"
              >
                {browseText}
              </Button>
              {hint && (
                <div className="sds-file-upload__secondary-text">{hint}</div>
              )}
            </div>
          </div>
        </div>
      </>

      <input
        {...props}
        ref={fileInputRef}
        type="file"
        id={id}
        name={name}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        required={required}
        onChange={handleInputChange}
        className="sds-file-upload__input"
      />
      {files.length > 0 && (
        <List className="sds-file-upload__files">
          {files.map((fileItem, index) => (
            <ListItem
              key={fileItem.id}
              hasDivider={index < files.length - 1}
              secondaryAction={
                <IconButton
                  type="button"
                  onClick={() => removeFile(fileItem.id)}
                  aria-label={`Remove ${fileItem.name}`}
                >
                  <TrashIcon />
                </IconButton>
              }
            >
              <ListItemIcon>{getStatusIcon(fileItem.status)}</ListItemIcon>
              <ListItemText
                primaryText={fileItem.name}
                secondaryText={getStatusText(fileItem.status, fileItem.error)}
              />
            </ListItem>
          ))}
        </List>
      )}
    </FormElement>
  );
};

FileUpload.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  maxFiles: PropTypes.number,
  maxFileSize: PropTypes.number,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  onFilesChange: PropTypes.func,
  onFileUpload: PropTypes.func,
  className: PropTypes.string,
  title: PropTypes.string,
  dragText: PropTypes.string,
  browseText: PropTypes.string,
};

export default FileUpload;
