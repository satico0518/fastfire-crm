import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import UsersTableComponent from "../UsersTableComponent";
import { Box } from "@mui/material";

jest.mock("@mui/x-data-grid", () => ({
  DataGrid: jest.fn(({ rows, columns }) => (
    <table role="grid">
      <thead>
        <tr>
          {columns.map((col: { field: string; headerName?: string }) => (
            <th key={col.field}>{col.headerName || col.field}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row: { key: string; id?: string }) => (
          <tr key={row.key || row.id}>
            {columns.map((col: { field: string; renderCell?: (p: unknown) => unknown }) => (
              <td key={col.field}>
                {col.renderCell
                  ? String(col.renderCell({ row, value: (row as Record<string, unknown>)[col.field], field: col.field } as never))
                  : String((row as Record<string, unknown>)[col.field] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )),
  GridActionsCellItem: jest.fn(({ label, onClick }: { label?: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick} aria-label={label || "action"}>
      {label}
    </button>
  )),
}));

jest.mock("../../../stores/users/users.store", () => ({
  useUsersStore: jest.fn((selector) =>
    selector({
      users: [
        {
          key: "u1",
          firstName: "Ana",
          lastName: "Lopez",
          email: "ana@example.com",
          isActive: true,
          permissions: ["USER"],
          workgroupKeys: ["wg1"],
          color: "#FF5722",
        },
      ],
    })
  ),
}));

jest.mock("../../../stores/workgroups/workgroups.store", () => ({
  useWorkgroupStore: jest.fn((selector) =>
    selector({
      workgroups: [
        {
          key: "wg1",
          name: "Grupo 1",
          isActive: true,
          isPrivate: false,
          color: "#4CAF50",
          memberKeys: ["u1"],
          createdDate: Date.now(),
        },
      ],
    })
  ),
}));

jest.mock("../../../stores/ui/ui.store", () => ({
  useUiStore: jest.fn((selector) =>
    selector({
      setSnackbar: jest.fn(),
      setConfirmation: jest.fn(),
      modal: { open: false, title: "", content: null },
      setModal: jest.fn(),
    })
  ),
}));

describe("UsersTableComponent", () => {
  it("renderiza la grilla de usuarios", () => {
    render(
      <Box sx={{ height: 400, width: "100%" }}>
        <UsersTableComponent />
      </Box>
    );

    expect(screen.getByRole("grid")).toBeInTheDocument();
  });
});
