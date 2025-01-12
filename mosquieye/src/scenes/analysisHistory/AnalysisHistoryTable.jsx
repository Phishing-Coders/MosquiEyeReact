import React, { useState } from 'react';
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Button, Box, Typography, IconButton, CircularProgress, Snackbar, Alert, Select, MenuItem } from '@mui/material'; // Update imports
import { Delete as DeleteIcon, Edit as EditIcon, Save, Cancel as CancelIcon } from '@mui/icons-material'; // Update imports
import ExcelJS from 'exceljs';
import axios from 'axios';
import { Buffer } from 'buffer';
import { saveAs } from 'file-saver';
import { gridFilteredSortedRowIdsSelector, useGridSelector, useGridApiContext, GridRowModes, GridActionsCellItem } from '@mui/x-data-grid'; // Add GridRowModes and GridActionsCellItem imports
import CustomLoadingOverlay from './CustomLoadingOverlay'; // Import the custom loading overlay

const CustomToolbar = ({ onExport, isExportingXLSX }) => {
  const apiRef = useGridApiContext(); // Use the grid's API context

  const filteredSortedRowIds = useGridSelector(apiRef, gridFilteredSortedRowIdsSelector); // Correct usage

  const handleExport = () => {
    onExport(filteredSortedRowIds); // Pass the selected row IDs to the export function
  };

  return (
    <GridToolbarContainer 
      sx={{ 
        backgroundColor: '#333', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        '& .MuiButton-root': { color: 'white' }, 
        '& .MuiIconButton-root': { color: 'white' } 
      }}
    >
      <Box>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <Button
          variant="contained"
          onClick={handleExport} // Use the new handler
          disabled={isExportingXLSX} // Disable button when exporting
          sx={{ 
            backgroundColor: '#555', 
            '&:hover': { backgroundColor: '#666' }, 
            marginLeft: 2, 
            minWidth: '150px', 
            marginBottom: 1 
          }} // Add marginBottom
        >
          {isExportingXLSX ? <CircularProgress size={24} color="inherit" /> : 'Download XLSX'}
        </Button>
      </Box>
      <Box>
        <GridToolbarQuickFilter /> {/* Add the search box */}
      </Box>
    </GridToolbarContainer>
  );
};

const AnalysisHistoryTable = ({
  rows,
  columnVisibilityModel,
  setColumnVisibilityModel,
  isExportingXLSX,
  setIsExportingXLSX,
  onToggleRow,
  openRowId,
  apiRef,
  loading,
  handleDelete,
  users
}) => {
  const [editingRowId, setEditingRowId] = useState(null); // Track the row being edited
  const [savingRowIds, setSavingRowIds] = useState([]); // Track rows being saved
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' }); // Notification state
  const [rowModesModel, setRowModesModel] = useState({}); // Add rowModesModel state

  // Add handleCloseNotification function
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    handleDelete(id);
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow) => {
    try {
      // Destructure to exclude non-editable fields
      const { breteauIndex, moi, riskLevel, imageUrl, ...editableData } = newRow;

      await axios.put(`/api/images/${newRow.id}`, editableData); // Send only editable fields
      setNotification({ open: true, message: 'Successfully updated the analysis.', severity: 'success' });
      return newRow;
    } catch (error) {
      console.error('Error updating analysis:', error);
      setNotification({ open: true, message: 'Failed to update the analysis.', severity: 'error' });
      throw error;
    }
  };

  const handleRowModesModelChange = (newModel) => {
    setRowModesModel(newModel);
  };

  const userOptions = users ? users.map((u) => `${u.firstName} ${u.lastName}`) : [];

  // Define columns inside the component
  const columns = [
    {
      field: 'expand',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      disableExport: true,
      renderCell: (params) => (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onToggleRow(params.row.id); // Update this line
          }}
          size="small"
        >
          {params.row.id === openRowId ? '-' : '+'} {/* Toggle icon */}
        </IconButton>
      ),
    },
    {
      field: 'imageUrl',
      headerName: 'Image',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <img
          src={params.value || 'https://via.placeholder.com/80?text=No+Image'}
          alt="Analysis result"
          style={{ width: '80px', cursor: 'pointer' }}
          onClick={() => {
            // Implement image selection if needed
          }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
        />
      ),
    },
    {
      field: 'imageType',
      headerName: 'Image Type',
      flex: 1,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['magnified', 'microscope', 'paper strip'],
    },
    { field: 'totalEggs', headerName: 'Total Eggs', flex: 1 },
    { field: 'singleEggs', headerName: 'Single Eggs', flex: 1 },
    { field: 'clusterEggs', headerName: 'Cluster Eggs', flex: 1 },
    {
      field: 'breteauIndex',
      headerName: 'Breteau Index (BI)',
      flex: 1,
      // Remove editable: true
      // editable: true,
    },
    {
      field: 'moi',
      headerName: 'Mosquito Ovitrap Index (MOI)',
      flex: 1,
      // Remove editable: true
      // editable: true,
    },
    {
      field: 'riskLevel',
      headerName: 'Risk Level',
      flex: 1,
      // Remove editable: true
      // editable: true,
      type: 'singleSelect',
      valueOptions: ['High', 'Medium', 'Low'],
    },
    {
      field: 'date',
      headerName: 'Date',
      type: 'date',
      flex: 1,
      editable: true,
    },
    {
      field: 'scanBy',
      headerName: 'Scan By',
      flex: 1,
      editable: true,
      type: 'singleSelect',
      valueOptions: userOptions,
    },
    { field: 'singlesTotalArea', headerName: 'Singles Total Area', flex: 1, hide: true },
    { field: 'singlesAvg', headerName: 'Singles Average Size', flex: 1, hide: true },
    { field: 'clustersTotalArea', headerName: 'Clusters Total Area', flex: 1, hide: true },
    { field: 'avgClusterArea', headerName: 'Average Cluster Area', flex: 1, hide: true },
    { field: 'avgEggsPerCluster', headerName: 'Average Eggs Per Cluster', flex: 1, hide: true },
    { field: 'affectedAreaSingles', headerName: 'Affected Area (Singles)', flex: 1, hide: true },
    { field: 'affectedAreaClusters', headerName: 'Affected Area (Clusters)', flex: 1, hide: true },
    // Add the Actions column
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<Save sx={{ color: 'white' }} />} // Set Save icon color to white
              label="Save"
              onClick={handleSaveClick(id)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  // Make cells editable based on rowModesModel
  const editableColumns = columns.map((col) => {
    if (col.field === 'actions' || col.field === 'expand' || col.field === 'imageUrl') {
      return col;
    }
    return {
      ...col,
      editable: true,
    };
  });

  const handleExportCSV = async (filteredSortedRowIds) => {
    setIsExportingXLSX(true);
    try {
      const displayedRows = filteredSortedRowIds.map((id) => {
        const row = rows.find(r => r.id === id);
        return row;
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Analysis History');

      // Define worksheet columns excluding 'actions' and include 'id'
      const exportColumns = columns
        .filter(col => col.field !== 'actions' && col.field !== 'expand') // Exclude 'actions' and 'expand'
        .map(col => ({
          header: col.headerName,
          key: col.field,
          width: col.field === 'id' || col.field === 'scanBy' || col.field === 'date' ? 20 : col.headerName.length + 5, // Adjust width for specific columns
        }));

      // Add 'ID' column at the beginning
      exportColumns.unshift({
        header: 'ID',
        key: 'id',
        width: 40,
      });

      worksheet.columns = exportColumns;

      // Add rows and images
      for (let i = 0; i < displayedRows.length; i++) {
        const row = displayedRows[i];
        const rowData = exportColumns.map(col => row[col.key]);
        const excelRow = worksheet.addRow(rowData);

        // Set row height to 40
        excelRow.height = 40;

        // Add image if imageUrl exists
        if (row.imageUrl) {
          try {
            // Fetch the image as a buffer
            const response = await axios.get(row.imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');

            // Determine image extension
            const extension = response.headers['content-type'].split('/')[1] || 'jpeg'; // Default to 'jpeg' if undefined

            // Add image to workbook
            const imageId = workbook.addImage({
              buffer: imageBuffer,
              extension,
            });

            // Calculate the cell position
            const columnNumber = exportColumns.findIndex(col => col.key === 'imageUrl') + 1;
            const rowNumber = i + 2; // +2 to account for header row

            // Create a temporary image to get dimensions
            const img = new Image();
            img.src = `data:image/${extension};base64,${imageBuffer.toString('base64')}`;
            await new Promise((resolve) => {
              img.onload = resolve;
            });

            // Calculate scaled dimensions to maintain aspect ratio
            const maxHeight = 40;
            const maxWidth = 50;
            let imgWidth = maxWidth;
            let imgHeight = (img.height * maxWidth) / img.width;

            if (imgHeight > maxHeight) {
              imgHeight = maxHeight;
              imgWidth = (img.width * maxHeight) / img.height;
            }

            // Position the image over the cell with maintained scale
            worksheet.addImage(imageId, {
              tl: { col: columnNumber - 1, row: rowNumber - 1 }, // Zero-based and adjusted for header
              ext: { width: imgWidth, height: imgHeight }, // Maintain aspect ratio
              editAs: 'oneCell',
            });
          } catch (error) {
            console.error(`Error fetching image for row ${i + 1}:`, error);
            // Optionally, handle the error as needed
          } finally {
            // Always clear the imageUrl cell to prevent URL string from appearing
            const cellAddress = `${String.fromCharCode(64 + (exportColumns.findIndex(col => col.key === 'imageUrl') + 1))}${i + 2}`;
            worksheet.getCell(cellAddress).value = '';
          }
        }
      }

      // Write workbook and trigger download
      await workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'analysis-history.xlsx');
      });
    } catch (error) {
      console.error('Error generating Excel file:', error);
    } finally {
      setIsExportingXLSX(false);
    }
  };

  const handleProcessRowUpdateError = (error) => {
    console.error('Error updating analysis:', error);
    setNotification({ open: true, message: 'Failed to update the analysis.', severity: 'error' });
  };

  return (
    <Box style={{ height: 600, width: '100%' }}>
      <DataGrid
        apiRef={apiRef} // Pass apiRef to the DataGrid
        rows={rows}
        columns={editableColumns} // Use the updated columns
        rowHeight={60}
        pagination
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
        slots={{
          toolbar: () => <CustomToolbar onExport={handleExportCSV} isExportingXLSX={isExportingXLSX} />, // Pass isExportingXLSX to CustomToolbar
          noRowsOverlay: () => (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography>No records found</Typography>
            </Box>
          ),
          loadingOverlay: CustomLoadingOverlay // Add the custom loading overlay
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
            sx: {
              color: 'white',
              '& .MuiButton-text': { color: 'white' },
              '& .MuiInput-root': { color: 'white' },
              '& .MuiIconButton-root': { color: 'white' },
            },
          },
        }}
        loading={loading || isExportingXLSX} // Update the loading prop
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        processRowUpdate={processRowUpdate}
        editMode="row"
        onRowEditStop={(params, event) => handleRowEditStop(params, event)}
        onProcessRowUpdateError={handleProcessRowUpdateError} // Add this line
      />
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification} // Use the defined handler
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AnalysisHistoryTable;