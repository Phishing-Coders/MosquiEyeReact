// import React, { useState } from 'react';
// import { Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
// import { useTranslation } from 'react-i18next';
// import { Box } from "@mui/material";
// import Header from "../../components/Header";


// const AppAnalysis = ({ analyzedImages = [], analyzedImagesPretty = [] }) => {
//   const { t } = useTranslation();
//   const [window, setWindow] = useState(0);
//   const [showAnalysis, setShowAnalysis] = useState(true);
//   const [analysisStarted, setAnalysisStarted] = useState(true); // Assuming analysis has started

//   const prev = () => {
//     setWindow((prevWindow) => (prevWindow > 0 ? prevWindow - 1 : analyzedImages.length - 1));
//   };

//   const next = () => {
//     setWindow((prevWindow) => (prevWindow < analyzedImages.length - 1 ? prevWindow + 1 : 0));
//   };

//   return (
//     <Box>
//       <Header title="Analysis" subtitle="" />
//       <Container>
//       {analysisStarted && (
//         <Grid container spacing={3}>
//           <Grid item xs={12} md={8} lg={8} xl={9}>
//             <Card>
//               {analyzedImages.length > 0 && analyzedImages.map((item, index) => (
//                 <div key={item.output} style={{ display: window === index ? 'block' : 'none' }}>
//                   <canvas id={item.output} className="imageCanvasOuter" style={{ display: showAnalysis ? 'block' : 'none' }}>
//                     <img className="imageCanvasInner" id="analyzedImage" src={item.output} style={{ height: '100px' }} />
//                   </canvas>
//                   <canvas id={item.source} className="imageCanvasOuter" style={{ display: !showAnalysis ? 'block' : 'none' }}>
//                     <img className="imageCanvasInner" id="analyzedImage" src={item.source} />
//                   </canvas>
//                 </div>
//               ))}
//             </Card>

//             <Card className="my-3">
//               <CardContent>
//                 <Grid container alignItems="center" spacing={2}>
//                   <Grid item>
//                     <Typography variant="h1" className="title">
//                       {analyzedImagesPretty[window]}
//                     </Typography>
//                     <Typography variant="h2" className="subheading">
//                       ({window + 1} {t('of')} {analyzedImages.length})
//                     </Typography>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>

//             <Grid container justify="space-between">
//               <Button onClick={prev} variant="contained" color="primary">
//                 Previous
//               </Button>
//               <Button onClick={next} variant="contained" color="primary">
//                 Next
//               </Button>
//             </Grid>
//           </Grid>
//         </Grid>
//       )}
//     </Container>
//     </Box>
    
    
//   );
// };

// export default AppAnalysis;