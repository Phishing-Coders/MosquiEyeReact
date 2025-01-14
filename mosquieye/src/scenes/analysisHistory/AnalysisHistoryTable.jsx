import React, { useState, useEffect } from 'react'; // Add useEffect
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Button, Box, Typography, IconButton, CircularProgress, Snackbar, Alert, Select, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'; // Add Dialog imports
import { Delete as DeleteIcon, Edit as EditIcon, Save, Cancel as CancelIcon } from '@mui/icons-material'; // Update imports
import ExcelJS from 'exceljs';
import axios from 'axios';
import { Buffer } from 'buffer';
import { saveAs } from 'file-saver';
import { gridFilteredSortedRowIdsSelector, useGridSelector, useGridApiContext, GridRowModes, GridActionsCellItem } from '@mui/x-data-grid'; // Add GridRowModes and GridActionsCellItem imports
import CustomLoadingOverlay from './CustomLoadingOverlay'; // Import the custom loading overlay
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

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

// Add refreshData prop to component parameters
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
  users,
  refreshData  // Add this prop
}) => {
  const [editingRowId, setEditingRowId] = useState(null); // Track the row being edited
  const [savingRowIds, setSavingRowIds] = useState([]); // Track rows being saved
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' }); // Notification state
  const [rowModesModel, setRowModesModel] = useState({}); // Add rowModesModel state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pendingSaveId, setPendingSaveId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tableSize, setTableSize] = useState({
    width: '100%',
    height: window.innerHeight - 200 // Initial height (viewport height minus margins/padding)
  });

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      setTableSize({
        width: '100%',
        height: window.innerHeight - 200 // Adjust this value based on your needs
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call once to set initial size
    handleResize();

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add handleCloseNotification function
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setPendingSaveId(id);
    setSaveDialogOpen(true);
  };

  // Modify handleConfirmSave to actually process the update
  const handleConfirmSave = async () => {
    if (pendingSaveId) {
      try {
        // Get the current row data
        const editedRow = rows.find(row => row.id === pendingSaveId);
        if (editedRow) {
          // Process the update
          await processRowUpdate(editedRow);
          
          // Refresh the data after successful update
          await refreshData();
          
          // Change mode back to view
          setRowModesModel(prev => ({
            ...prev,
            [pendingSaveId]: { mode: GridRowModes.View }
          }));
          
          setNotification({
            open: true,
            message: 'Successfully updated the analysis.',
            severity: 'success'
          });
        }
      } catch (error) {
        console.error('Error saving changes:', error);
        setNotification({
          open: true,
          message: 'Failed to save changes',
          severity: 'error'
        });
      }
    }
    setSaveDialogOpen(false);
    setPendingSaveId(null);
  };

  const handleCancelSave = () => {
    setPendingSaveId(null);
    setSaveDialogOpen(false);
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

  const processRowUpdate = React.useCallback(
    async (newRow) => {
      try {
        // Get the current row's complete data
        const currentRow = rows.find(row => row.id === newRow.id);
        if (!currentRow) {
          throw new Error('Row not found');
        }

        // Create updated analysis data
        const updatedAnalysisData = {
          ...currentRow.analysisData,
          totalEggs: parseInt(newRow.totalEggs) || 0,
          singleEggs: parseInt(newRow.singleEggs) || 0,
          clustersCount: parseInt(newRow.clusterEggs) || 0,
          singlesTotalArea: parseFloat(newRow.singlesTotalArea) || 0,
          singlesAvg: parseFloat(newRow.singlesAvg) || 0,
          clustersTotalArea: parseFloat(newRow.clustersTotalArea) || 0,
          avgClusterArea: parseFloat(newRow.avgClusterArea) || 0,
          avgEggsPerCluster: parseFloat(newRow.avgEggsPerCluster) || 0,
          ovitrap_type: newRow.imageType || currentRow.analysisData.ovitrap_type,
          scan_by: users.find(u => `${u.firstName} ${u.lastName}` === newRow.scanBy)?.clerkUserId || currentRow.analysisData.scan_by
        };

        console.log('Sending update data:', {
          analysisData: updatedAnalysisData
        });

        const response = await axios.put(`/api/images/${newRow.id}`, {
          analysisData: updatedAnalysisData
        });

        if (response.status === 200) {
          await refreshData();
          setNotification({
            open: true,
            message: 'Successfully updated the analysis.',
            severity: 'success'
          });
          return newRow;
        } else {
          throw new Error('Update failed');
        }
      } catch (error) {
        console.error('Error updating analysis:', error);
        setNotification({
          open: true,
          message: 'Failed to update the analysis.',
          severity: 'error'
        });
        throw error;
      }
    },
    [refreshData, users, rows] // Add rows to dependencies
  );

  const handleRowEditStop = React.useCallback((params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  }, []);

  const handleRowModesModelChange = (newModel) => {
    setRowModesModel(newModel);
  };

  const userOptions = users ? users.map((u) => `${u.firstName} ${u.lastName}`) : [];

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setZoomLevel(1); // Reset zoom level when opening new image
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5)); // Min zoom 0.5x
  };

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
          style={{ 
            width: '50px', 
            height: '50px', 
            objectFit: 'cover',
            cursor: 'pointer',
            display: 'block',
            margin: 'auto',
            marginTop: '5px'
          }}
          onClick={() => handleImageClick(params.value)}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
        />
      ),
    },
    {
      field: 'ovitrapId', // Add new column for Ovitrap ID
      headerName: 'Ovitrap ID',
      flex: 1,
      editable: false,
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
      width: 100,
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
    <>
      <Box style={{ 
        height: tableSize.height, 
        width: tableSize.width, 
        transition: 'height 0.3s ease', // Smooth transition for height changes
        marginBottom: '6rem',
      }}>
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
          onRowEditStop={handleRowEditStop}
          onProcessRowUpdateError={handleProcessRowUpdateError} // Add this line
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#333', // Adjust header background color if needed
              color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'black',
              fontWeight: 'bold', // Make header text bold
              fontSize: '1rem', // Adjust header text size if needed
            },
            '& .MuiDataGrid-cell': {
              color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'black',
              //fontWeight: 'bold', // Make header text bold
              fontSize: '14px', // Adjust header text size if needed
            }
          }}
          
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
      
      {/* Add the confirmation dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={handleCancelSave}
        aria-labelledby="save-dialog-title"
        aria-describedby="save-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: '#1F2A40',
            color: 'white'
          }
        }}
      >
        <DialogTitle id="save-dialog-title">
          Confirm Save
        </DialogTitle>
        <DialogContent id="save-dialog-description">
          Are you sure you want to save these changes?
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelSave} 
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmSave} 
            variant="contained" 
            sx={{ 
              backgroundColor: '#3da58a',
              '&:hover': {
                backgroundColor: '#2e7c67'
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Image Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={handleCloseImage}
        maxWidth={false}
        PaperProps={{
          sx: {
            backgroundColor: '#1F2A40',
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: 'auto',
            height: 'auto'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {/* Zoom controls */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '8px',
              padding: '4px'
            }}
          >
            <IconButton onClick={handleZoomIn} sx={{ color: 'white' }}>
              <AddIcon />
            </IconButton>
            <Typography sx={{ display: 'inline', mx: 1, color: 'white' }}>
              {Math.round(zoomLevel * 100)}%
            </Typography>
            <IconButton onClick={handleZoomOut} sx={{ color: 'white' }}>
              <RemoveIcon />
            </IconButton>
          </Box>

          {/* Image container with scroll */}
          <Box
            sx={{
              overflow: 'auto',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Analysis result enlarged"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-in-out',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnalysisHistoryTable;
