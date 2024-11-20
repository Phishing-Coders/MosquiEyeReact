<Container >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="upload-image"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="upload-image">
                <Button variant="contained" align="center" color="primary" component="span" startIcon={<PhotoCamera />}>
                  Select Image
                </Button>
              </label>
              {imageSrc && (
                <div>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={4 / 3}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                  <Slider
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e, zoom) => setZoom(zoom)}
                  />
                  <Button variant="contained" color="primary" onClick={handleCrop} startIcon={<CheckCircle />}>
                    Analyze
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => setImageSrc(null)} startIcon={<Cancel />}>
                    Remove
                  </Button>
                </div>
              )}
              <CardContent>
                <Typography variant="h2">Microscope</Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  Image is square, and mosquito eggs are clearly visible as large objects.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container> *