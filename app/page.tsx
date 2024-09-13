"use client";
import * as React from 'react';
import './custom-theme.scss';  // Make sure this file exists and is loaded
import products from "./shared-gd-products.json";  // Ensure this path and file are correct
import { Grid, GridColumn as Column, GridDataStateChangeEvent as Event, GridCustomCellProps as Props, GridItemChangeEvent as Item, GridRowClickEvent as Row, GridToolbar } from "@progress/kendo-react-grid";
import { process, State, DataResult } from "@progress/kendo-data-query";
import { GridPDFExport } from "@progress/kendo-react-pdf";
import { Button } from "@progress/kendo-react-buttons";

interface ProductCategory {
  CategoryID?: number;
  CategoryName?: string;
  Description?: string;
}

interface Product {
  ProductID: number;
  ProductName?: string;
  SupplierID?: number;
  CategoryID?: number;
  QuantityPerUnit?: string;
  UnitPrice?: number;
  UnitsInStock?: number;
  UnitsOnOrder?: number;
  ReorderLevel?: number;
  Discontinued?: boolean;
  Category?: ProductCategory;
  inEdit?: boolean | string;
}

const categoryNameEmoticons: { [key: string]: string } = {
  'Beverages': '🍹',
  'Condiments': '🥫',
  'Confections': '🍬',
  'Dairy Products': '🥛',
  'Grains/Cereals': '🌾',
  'Meat/Poultry': '🍗',
  'Produce': '🥕',
  'Seafood': '🐟',
};

const EmoticonCell = (props: Props) => {
  const emoticon = categoryNameEmoticons[props.dataItem.Category.CategoryName] || '❓';
  return (
    <td>
      <span style={{ fontSize: '16px', marginRight: '8px' }}>{emoticon}</span>
      {props.dataItem.Category.CategoryName}
    </td>
  );
};

export default function Home() {
  
  const initialDataState: State = {
    skip: 0,
    take: 20,
    sort: [],
    filter: {
      logic: "or",
      filters: [],
    },
  }

  const [dataState, setDataState] = React.useState<State>(initialDataState);
  const [data, setData] = React.useState<Product[]>(products);
  const [editID, setEditID] = React.useState<number | null>(null);
  let gridPDFExport: GridPDFExport | null;


  const exportPDF = () => {
    if (gridPDFExport) {
      gridPDFExport.save(products);
    }
  };

  const handleDataStateChange = (e: Event) => {
    setDataState(e.dataState);
  };

  const handleRowClick = (e: Row) => {
    setEditID(e.dataItem.ProductID);
  };

  const handleItemChange = (e: Item) => {
    const inEditID = e.dataItem.ProductID;
    const field = e.field || '';
    const newData = data.map((item) =>
      item.ProductID === inEditID ? { ...item, [field]: e.value } : item
    );
    setData(newData);
  };

  const grid = (
    <Grid 
      data={{...process(data, dataState) as DataResult, 
            data: process(data, dataState).data.map((item: Product) => ({
              ...item,
              inEdit: item.ProductID === editID
            }))}}
      pageable={true}
      skip={dataState.skip}
      take={dataState.take}
      total={products.length}
      sortable={true}
      sort={dataState.sort}
      filterable={true}
      filter={dataState.filter}
      editField="inEdit"
      onRowClick={handleRowClick}
      onItemChange={handleItemChange}
      onDataStateChange={handleDataStateChange}
      {...dataState}
    >

      <GridToolbar>
        <Button className="k-button" onClick={exportPDF}>Export PDF</Button>
      </GridToolbar>

      <Column field="ProductID" title="ID"/>
      <Column field="ProductName" title="Name"/>
      <Column field="Category.CategoryName" title="Category" cell={EmoticonCell}/>
      <Column field="UnitPrice" title="Price"/>
      <Column field="UnitsInStock" title="In stock"/>
      <Column field="Discontinued" title="Discontinued"/>
    </Grid>
  );

  return (
    <div className='grid-wrapper'>
      {grid}
      <GridPDFExport ref={(pdfExport) => { gridPDFExport = pdfExport; }} paperSize={'A4'} landscape={true} margin={"1cm"} scale={0.5}>
          {grid }
      </GridPDFExport>
    </div>
  );
}
