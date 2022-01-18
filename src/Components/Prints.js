import * as React from 'react';
import { Button } from '@mui/material';
import {Container} from '@mui/material'
import {Dialog, DialogTitle} from '@mui/material'
import {Link} from 'react-router-dom';
import MaterialTable from 'material-table';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import JobDetail from './JobDetail';

function SimpleDialog(props) {
    const { onClose, selectedValue, open, jobId } = props;

    const handleClose = () => {
      onClose(selectedValue);
    };
  

  
    return (
      <Dialog onClose={handleClose} open={open} fullWidth="true" maxWidth="sm">
        <DialogTitle>Job Details</DialogTitle>
        <JobDetail jobId={jobId}/>
      </Dialog>
    );
  }


function Prints() {

    const [open, setOpen] = React.useState(false);
    const [jobId, setJobId] = React.useState(false);
    //const [selectedValue, setSelectedValue] = React.useState(emails[1]);

    const handleClickOpen = (jobId) => {
        setOpen(true);
        setJobId(jobId);
    };

    const handleClose = (value) => {
        setOpen(false);
        //setSelectedValue(value);
    };

  return (
    <Container>
    <Link className='btn' role="button" to="/"><Button>Back</Button></Link>
    <MaterialTable
      title="Print Jobs"
      options={{
        rowStyle: {
          fontSize: 12,
        }
      }}
      columns={[

        { title: 'Job Id', field: 'orderPrintJobId' },
        { title: 'Order Id', field: 'order_OrderId' },
        { title: 'Name', field: 'customer.name' },
        { title: 'Order Date', field: 'orderDate' },
      ]}
      actions={[
        {
          icon: () => <RemoveRedEyeOutlinedIcon/>,
          tooltip: 'Open Order',
          onClick: (event, rowData) => handleClickOpen(rowData.orderPrintJobId)
        },
        rowData => ({
          icon: () => <LocalPrintshopOutlinedIcon/>,
          tooltip: 'Send To Printer',
          onClick: (event, rowData) => window.confirm("You want to delete " + rowData.name),
          disabled: rowData.birthYear < 2000
        })
      ]}
      options={{
        actionsColumnIndex: -1
      }}
      data={query =>
        new Promise((resolve, reject) => {
          let url = 'https://admin.fotostore.ie/api/admin/print-jobs?'
          url += 'per_page=' + query.pageSize
          url += '&page=' + (query.page + 1)
          fetch(url)
            .then(response => response.json())
            .then(result => {
              resolve({
                data: result,
                page: result.page - 1,
                totalCount: result.length,
              })
            })
        })
      }
    />
    <SimpleDialog
        open={open}
        onClose={handleClose}
        jobId={jobId}
        />
    </Container>
  );
}

export default Prints;