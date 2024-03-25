import * as React from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import { Button, TextField } from "@mui/material";
import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import PaperBase from "../dashboard/Paperbase";
import AddCustomer from "./AddCustomer";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect } from "react";
import { CUSTOMERS, ADDRESS } from "../../api/api";
import { useNavigate } from "react-router-dom";

function createData(
  id,
  name,
  company_name,
  email,
  address,
  vat_number,
  vat_office,
  phone,
  mobile,
  notes
) {
  return {
    id,
    name,
    company_name,
    email,
    address,
    vat_number,
    vat_office,
    phone,
    mobile,
    notes,
  };
}

const rows2 = [
  createData(
    1,
    "John Doe",
    "ABC Company",
    "john.doe@example.com",
    "123 Main St",
    "123456789",
    "VAT Office 1",
    "555-1234",
    "555-5678",
    "Some notes about John Doe"
  ),
  createData(
    2,
    "Jane Smith",
    "XYZ Corporation",
    "jane.smith@example.com",
    "456 Oak St",
    "987654321",
    "VAT Office 2",
    "555-9876",
    "555-4321",
    "Some notes about Jane Smith"
  ),
  createData(
    3,
    "Alice Johnson",
    "LMN Ltd",
    "alice.johnson@example.com",
    "789 Pine St",
    "456789012",
    "VAT Office 3",
    "555-5678",
    "555-1234",
    "Some notes about Alice Johnson"
  ),
  createData(
    4,
    "Bob Williams",
    "PQR Inc",
    "bob.williams@example.com",
    "101 Cedar St",
    "345678901",
    "VAT Office 4",
    "555-4321",
    "555-9876",
    "Some notes about Bob Williams"
  ),
  createData(
    5,
    "Eva Davis",
    "UVW Enterprises",
    "eva.davis@example.com",
    "202 Elm St",
    "234567890",
    "VAT Office 5",
    "555-8765",
    "555-2109",
    "Some notes about Eva Davis"
  ),
  createData(
    6,
    "Michael Miller",
    "LMN Ltd",
    "michael.miller@example.com",
    "303 Oak St",
    "567890123",
    "VAT Office 6",
    "555-3210",
    "555-7654",
    "Some notes about Michael Miller"
  ),
  createData(
    7,
    "Emily Davis",
    "ABC Company",
    "emily.davis@example.com",
    "404 Pine St",
    "678901234",
    "VAT Office 7",
    "555-2109",
    "555-8765",
    "Some notes about Emily Davis"
  ),
  createData(
    8,
    "David Smith",
    "PQR Inc",
    "david.smith@example.com",
    "505 Cedar St",
    "789012345",
    "VAT Office 8",
    "555-7654",
    "555-3210",
    "Some notes about David Smith"
  ),
  createData(
    9,
    "Sophia Johnson",
    "XYZ Corporation",
    "sophia.johnson@example.com",
    "606 Elm St",
    "890123456",
    "VAT Office 9",
    "555-4321",
    "555-9876",
    "Some notes about Sophia Johnson"
  ),
  createData(
    10,
    "Matthew Williams",
    "UVW Enterprises",
    "matthew.williams@example.com",
    "707 Oak St",
    "901234567",
    "VAT Office 10",
    "555-9876",
    "555-4321",
    "Some notes about Matthew Williams"
  ),
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Name",
  },
  {
    id: "company_name",
    numeric: false,
    disablePadding: false,
    label: "Company Name",
  },
  {
    id: "email",
    numeric: false,
    disablePadding: false,
    label: "Email",
  },
  {
    id: "address",
    numeric: false,
    disablePadding: false,
    label: "Address",
  },
  {
    id: "vat_number",
    numeric: false,
    disablePadding: false,
    label: "VAT Number",
  },
  {
    id: "vat_office",
    numeric: false,
    disablePadding: false,
    label: "VAT Office",
  },
  {
    id: "phone",
    numeric: false,
    disablePadding: false,
    label: "Phone",
  },
  {
    id: "mobile",
    numeric: false,
    disablePadding: false,
    label: "Mobile",
  },
  {
    id: "notes",
    numeric: false,
    disablePadding: false,
    label: "Notes",
  },
  {
    id: "edit",
    numeric: false,
    disablePadding: false,
    label: "Edit",
  },
];

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all desserts",
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const { numSelected, onSearchChange, setShowAddCustomer } = props;

  const handleClickAddCustomer = () => {
    console.log("Add customer clicked");
    // Yeni state'i güncelle
    setShowAddCustomer(true);
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Customers
        </Typography>
      )}

      <TextField
        fullWidth
        placeholder="Search"
        sx={{ width: "30%", ml: 1, mr: 1, mt: 1, mb: 1 }}
        InputProps={{
          disableUnderline: true,
          sx: { fontSize: "default", mt: 2 },
          startAdornment: (
            <SearchIcon color="inherit" sx={{ display: "block" }} />
          ),
        }}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Tooltip title="Filter list">
              <IconButton>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </>
        )}

        <Button
          variant="outlined"
          startIcon={<AddCircleIcon />}
          sx={{ ml: 1 }}
          onClick={handleClickAddCustomer}
        >
          <Typography>Add</Typography>
          &nbsp;
          <Typography>Customer</Typography>
        </Button>
      </Box>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  setShowAddCustomer: PropTypes.func.isRequired, // Add prop type for setShowAddCustomer
};

export default function Customers() {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchInput, setSearchInput] = React.useState("");
  const [showAddCustomer, setShowAddCustomer] = React.useState(false); // Add state for showAddCustomer
  const [rows, setRows] = React.useState([]); // Change rows to state
  const navigate = useNavigate();

  const handleEditClick = (customerId) => {
    navigate(`/add-customer/${customerId}`);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n._id);
      console.log("New Selected: ", newSelected);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const filteredRows = React.useMemo(
    () =>
      rows.filter((row) =>
        Object.values(row).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(searchInput.toLowerCase())
        )
      ),
    [rows, searchInput]
  );

  const visibleRows = React.useMemo(
    () =>
      stableSort(filteredRows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [filteredRows, order, orderBy, page, rowsPerPage]
  );

  useEffect(() => {
    const fetchData = async () => {
      const userprofile = localStorage.getItem("userProfile");
      const userProfile = JSON.parse(userprofile);
      console.log("userprofilebilgi", userProfile);

      const [customers, error] = await CUSTOMERS.getAll({
        company_id: userProfile.company_id,
      });

      if (customers !== null) {
        // Fetch addresses for all customers concurrently
        const addressPromises = customers.map((item) =>
          ADDRESS.byId(item.address_id)
        );

        try {
          const addresses = await Promise.all(addressPromises);

          // Update the rows with the fetched addresses
          const updatedCustomers = customers.map((item, index) => {
            return {
              ...item,
              address: addresses[index][0],
            };
          });

          setRows(updatedCustomers);
        } catch (error) {
          console.error("Error fetching addresses:", error);
        }
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      {showAddCustomer ? (
        <>
          <IconButton onClick={() => setShowAddCustomer(false)}>
            <ArrowBackIcon />
          </IconButton>
          <AddCustomer />
        </>
      ) : (
        <Paper sx={{ width: "100%", mb: 2 }}>
          <EnhancedTableToolbar
            numSelected={selected.length}
            onSearchChange={handleSearchChange}
            setShowAddCustomer={setShowAddCustomer}
          />
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <EnhancedTableHead
                key={rows._id}
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
              />
              <TableBody>
                {visibleRows.map((row, index) => {
                  const isItemSelected = isSelected(row._id);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  console.log("Row: ", row);
                  return (
                    <TableRow
                      key={row._id}
                      hover
                      onClick={(event) => handleClick(event, row._id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      selected={isItemSelected}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            "aria-labelledby": labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.name}
                      </TableCell>
                      <TableCell align="left">{row.company_name}</TableCell>
                      <TableCell align="left">{row.email}</TableCell>
                      <TableCell align="left">
                        {row.address
                          ? `${row.address.street}, ${row.address.house_number}, ${row.address.postcode}, ${row.address.city}, ${row.address.country}`
                          : ""}
                      </TableCell>{" "}
                      <TableCell align="left">{row.vat_number}</TableCell>
                      <TableCell align="left">{row.vat_office}</TableCell>
                      <TableCell align="left">{row.phone}</TableCell>
                      <TableCell align="left">{row.mobile}</TableCell>
                      <TableCell align="left">{row.notes}</TableCell>
                      <TableCell align="left">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEditClick(row._id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  );
}
