import * as React from 'react';
import {Container, Grid, Button} from '@mui/material';
import { DataGrid }  from '@mui/x-data-grid';
import {ProductCategory} from '../Enums/ProductCategory';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import isElectron from 'is-electron';
const { PRINT_LABEL_NEEDED } = require('../actions/types');



class JobDetail extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        error: null,  
        isLoaded: false,
        jobId : props.jobId,
        data: null,
        orderItems: [],
        productCategory : ProductCategory
      };
    }

    
  
    componentDidMount() {
      fetch("https://admin.fotostore.ie/api/admin/print-jobs/" + this.state.jobId)
        .then(res => res.json())
        .then(
          (result) => {
            let orderItems = this.state.orderItems;

            if(result.productCategory === this.state.productCategory.PhotoPrint){
                result.orderItems.forEach(orderItem => {

                  const existingProduct = orderItems.find(element => element.id === orderItem.printSizeCode.trim());

                  if(existingProduct){
                    existingProduct.quantity += orderItem.quantity;
                  }
                  else{
                    orderItems.push({id : orderItem.printSizeCode.trim(),  product : "Prints " + orderItem.printSizeCode.trim(), quantity : orderItem.quantity})
                  }
                });
            }
            else if(result.productCategory === this.state.productCategory.PhotoBlock){

              result.photoBlocks.forEach(orderItem => {

                const existingProduct = orderItems.find(block => block.id === orderItem.size.trim());

                if(existingProduct){
                  existingProduct.quantity += orderItem.quantity;
                }
                else{
                  orderItems.push({id : orderItem.size.trim(),  product : "Block " + orderItem.size.trim(), quantity : orderItem.quantity})
                }
              });
            }
            else if(result.productCategory === this.state.productCategory.CanvasPrint){

              result.canvases.forEach(orderItem => {

                const existingProduct = orderItems.find(canvas => canvas.id === orderItem.size.trim());

                if(existingProduct){
                  existingProduct.quantity += orderItem.quantity;
                }
                else{
                  orderItems.push({id : orderItem.size.trim(),  product : "Canvas " + orderItem.size.trim(), quantity : orderItem.quantity})
                }
              });
            }
            else if(result.productCategory === this.state.productCategory.FramedPrint){

              result.framedPrints.forEach(orderItem => {

                const existingProduct = orderItems.find(frame => frame.id === orderItem.size.trim());

                if(existingProduct){
                  existingProduct.quantity += orderItem.quantity;
                }
                else{
                  orderItems.push({id : orderItem.size.trim(),  product : "Frame " + orderItem.size.trim(), quantity : orderItem.quantity})
                }
              });
            }

            this.setState({
              isLoaded: true,
              data: result,
              orderItems: orderItems
            });
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        )
    }

    
    
  
    render() {
      const { error, isLoaded, data, orderItems } = this.state;

      

      const rows = orderItems;

      function printLabel(e) {
        if(isElectron()){
          window.ipcRenderer.send(PRINT_LABEL_NEEDED , data);
        }
        
      }
      
      const columns = [
        { field: 'product', headerName: 'Product', width: 250 },
        { field: 'quantity', headerName: 'Quantity', width: 250 },
      ];

      if (error) {
        return <div>Error: {error.message}</div>;
      } else if (!isLoaded) {
        return <div>Loading...</div>;
      } else {
        return (
          
          <Container>
            <Grid container spacing={2}> 
              <Grid item xs={6}>
          <strong>Ship To</strong><br/>
          <span>{data.shipToName}</span><br/>
          <span>{data.shipToAddressLine1}</span><br/>
          {data.shipToAddressLine2 !== null &&
            <span>{data.shipToAddressLine2}</span>
          }
          {data.shipToAddressLine2 !== null &&
            <br/>
          }
          <span>{data.shipToTownCity}</span><br/>
          <span>{data.shipToCounty}</span><br/>
          <span>{data.shipToCountry}</span><br/>
          <span>{data.shipToPostCode}</span><br/>
          </Grid>
          <Grid item xs={6}>
            <Button variant="outlined" startIcon={<LocalPrintshopOutlinedIcon />} onClick={printLabel}>
            Print Label
            </Button>
            </Grid>
          </Grid>
         
          <div style={{ height: 200, width: '100%' }}>
            <DataGrid 
              rows={rows} 
              columns={columns} 
              hideFooterPagination="true"
              disableColumnMenu="true"
              disableSelectionOnClick="true"
              density="compact" />
          </div>
          </Container>
        );
      }
    }
  }

  export default JobDetail

