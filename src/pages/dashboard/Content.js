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
import { Button, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { visuallyHidden } from "@mui/utils";
import { useEffect } from "react";
import { PROJECT, ADDRESS, CUSTOMERS } from "../../api/api";
import AddProject from "../dashboard/AddProject";
import { useNavigate } from "react-router-dom";

const headCells = [
  { id: "name", numeric: false, disablePadding: true, label: "Project Name" },
  {
    id: "consumption",
    numeric: true,
    disablePadding: false,
    label: "Consumption",
  },
  {
    id: "consumption_period",
    numeric: true,
    disablePadding: false,
    label: "Consumption Period",
  },
  {
    id: "projectscol",
    numeric: true,
    disablePadding: false,
    label: "Projects Scol",
  },
  {
    id: "cosine_factor",
    numeric: true,
    disablePadding: false,
    label: "Cosine Factor",
  },
  {
    id: "export_limit",
    numeric: true,
    disablePadding: false,
    label: "Export Limit",
  },
  { id: "notes", numeric: true, disablePadding: false, label: "Notes" },
  { id: "address", numeric: true, disablePadding: false, label: "Address" },
  { id: "customer", numeric: true, disablePadding: false, label: "Customer" },
  // {
  //   id: "consumptionProfile",
  //   numeric: true,
  //   disablePadding: false,
  //   label: "Consumption Profile",
  // },
  // { id: "user", numeric: true, disablePadding: false, label: "User" },
  { id: "edit", numeric: true, disablePadding: false, label: "Edit" },
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
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

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
            inputProps={{ "aria-label": "select all projects" }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
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
  const { numSelected, onSearchChange, setShowAddProject, handleDelete } =
    props;

  const handleClickAddProject = () => {
    setShowAddProject(true);
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
          Projects
        </Typography>
      )}

      <TextField
        fullWidth
        placeholder="Search"
        sx={{ width: "50%", ml: 1, mr: 1, mt: 1, mb: 1 }}
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
            <IconButton onClick={handleDelete}>
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
          onClick={handleClickAddProject}
        >
          <Typography>Add</Typography>&nbsp;<Typography>Project</Typography>
        </Button>
      </Box>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  setShowAddProject: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default function Content() {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchInput, setSearchInput] = React.useState("");
  const [showAddProject, setShowAddProject] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const navigate = useNavigate();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
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
      const [projects, error] = await PROJECT.getAll();

      if (projects && projects.length > 0) {
        const addressPromises = projects.map((project) =>
          ADDRESS.byId(project.address_id)
        );
        const customerPromises = projects.map((project) =>
          CUSTOMERS.byId(project.customer_id)
        );
        // const userPromises = projects.map((project) =>
        //   USER.byId(project.user_id)
        // );

        const addresses = await Promise.all(addressPromises);
        const customers = await Promise.all(customerPromises);
        // const users = await Promise.all(userPromises);

        const formattedProjects = projects.map((project, index) => ({
          id: project._id,
          name: project.name,
          consumption: project.consumption,
          consumption_period: project.consumption_period,
          projectscol: project.projectscol,
          cosine_factor: project.cosine_factor,
          export_limit: project.export_limit !== 1 ? "Yes" : "No",
          notes: project.notes,
          address: addresses[index][0] || {},
          customer: customers[index][0] || {},
          solarpanel_id: project.solarpanel_id,
          // consumptionProfile: consumptionProfiles[index][0] || {},
          // user: users[index][0] || {},
        }));

        setRows(formattedProjects);
        console.log("data", formattedProjects);
      }
    };
    fetchData();
  }, []);

  const handleDeleteProject = async (ids) => {
    for (const id of ids) {
      const [response, error] = await PROJECT.deleteProject(id);
      if (!error) {
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      }
    }
    setSelected([]);
  };

  const showpanel = (solarPanel) => {
    console.log("solar id", solarPanel);
    navigate(`/show-project/${solarPanel}`);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {showAddProject ? (
        <>
          <IconButton onClick={() => setShowAddProject(false)}>
            <ArrowBackIcon />
          </IconButton>
          <AddProject />
        </>
      ) : (
        <Box sx={{ maxWidth: 1700, margin: "auto", overflow: "hidden" }}>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <EnhancedTableToolbar
              numSelected={selected.length}
              onSearchChange={handleSearchChange}
              setShowAddProject={setShowAddProject}
              handleDelete={() => handleDeleteProject(selected)}
            />
            <TableContainer>
              <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                <EnhancedTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={handleRequestSort}
                  rowCount={rows.length}
                />
                <TableBody>
                  {visibleRows.map((row, index) => {
                    const isItemSelected = isSelected(row.id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, row.id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id}
                        selected={isItemSelected}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{ "aria-labelledby": labelId }}
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
                        <TableCell align="left">{row.consumption}</TableCell>
                        <TableCell align="left">
                          {row.consumption_period}
                        </TableCell>
                        <TableCell align="left">{row.projectscol}</TableCell>
                        <TableCell align="left">{row.cosine_factor}</TableCell>
                        <TableCell align="left">{row.export_limit}</TableCell>
                        <TableCell align="left">{row.notes}</TableCell>
                        <TableCell align="left">
                          {row.address
                            ? `${row.address.street}, ${row.address.house_number}, ${row.address.postcode}, ${row.address.city}, ${row.address.country}`
                            : ""}
                        </TableCell>
                        <TableCell align="left">
                          {row.customer
                            ? `${row.customer.name}, ${row.customer.company_name}`
                            : ""}
                        </TableCell>
                        {/* <TableCell align="left">
                          {row.consumptionProfile
                            ? `${row.consumptionProfile.energy_consumed}, ${row.consumptionProfile.device_name}`
                            : ""}
                        </TableCell> */}
                        {/* <TableCell align="left">
                          {row.user
                            ? `${row.user.name}, ${row.user.email}`
                            : ""}
                        </TableCell> */}
                        <TableCell align="left">
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={(event) => {
                                event.stopPropagation();
                                showpanel(row.solarpanel_id._id);
                              }}
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
        </Box>
      )}
    </Box>
  );
}
