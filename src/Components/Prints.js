import * as React from 'react';
import { Button } from '@mui/material';
import {Container} from '@mui/material'
import {Link} from 'react-router-dom';
import MaterialTable from 'material-table';


function Prints() {
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

        { title: 'Id', field: 'orderId' },
        { title: 'Name', field: 'customer.name' },
        { title: 'Order Date', field: 'orderDate' },
      ]}
      data={query =>
        new Promise((resolve, reject) => {
          let url = 'https://admin.fotostore.ie/api/admin/orders?'
          url += 'per_page=' + query.pageSize
          url += '&page=' + (query.page + 1)
          fetch(url)
            .then(response => response.json())
            .then(result => {
              resolve({
                data: result,
                // page: result.page - 1,
                // totalCount: result.total,
              })
            })
        })
      }
    />
    </Container>
  );
}

export default Prints;