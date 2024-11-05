import { SetStateAction, useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Chip,
  Stack,
  Switch,
  TextField,
} from "@mui/material";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useUiStore } from "../../stores/ui/ui.store";
import { Workgroup } from "../../interfaces/Workgroup";
import { WorkgroupService } from "../../services/workgroup.service";
import { useUsersStore } from "../../stores/users/users.store";
import { GetUserNameByKey } from "../../utils/utils";
import { User } from "../../interfaces/User";
import { AutocompleteField } from "../../interfaces/Shared";
import { ColorPickerComponent } from "../color-picker/ColorPickerComponent";
import { ColorResult } from "react-color";

interface WorkgroupsFormComponentProps {
  editingGroup?: Workgroup;
}

export const WorkgroupsFormComponent = ({
  editingGroup,
}: WorkgroupsFormComponentProps) => {
  const [bgColor, setBgColor] = useState("deepskyblue");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isPrivate, setIsPrivate] = useState(editingGroup?.isPrivate ?? false);
  const [selectedMembers, setSelectedMembers] = useState<AutocompleteField[]>(
    []
  );
  const [availableMembers, setAvailableMembers] = useState<AutocompleteField[]>(
    []
  );
  const setIsLoading = useUiStore((state) => state.setIsLoading);
  const modal = useUiStore((state) => state.modal);
  const setModal = useUiStore((state) => state.setModal);
  const snackbar = useUiStore((state) => state.snackbar);
  const setSnackbar = useUiStore((state) => state.setSnackbar);
  const users = useUsersStore((state) => state.users);

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (editingGroup) {
      setValue("name", editingGroup.name);
      setValue("description", editingGroup.description ?? "");
      setIsPrivate(editingGroup.isPrivate);
      setBgColor(editingGroup.color);

      if (editingGroup.memberKeys?.length > 0) {
        setSelectedMembers(editingGroup.memberKeys.map((key) => ({
                key: key,
                label: GetUserNameByKey(key as string, users as User[]),
              })) as SetStateAction<AutocompleteField[]>
        );     
      }

      const availableEditingMembers = users
          ? users.filter(
              (user) => !editingGroup.memberKeys?.some((key) => user.key === key)
            )
          : [];

        setAvailableMembers(
          availableEditingMembers?.map((user) => ({
            key: user.key,
            label: GetUserNameByKey(user.key as string, users as User[]),
          })) as SetStateAction<AutocompleteField[]>
        );

      return;
    }

    setAvailableMembers(
      users?.map((user) => ({
        key: user.key,
        label: GetUserNameByKey(user.key as string, users),
      })) as SetStateAction<AutocompleteField[]>
    );
  }, [editingGroup, setValue, users]);

  const onSubmit = async (data: Workgroup) => {
    data = {
      ...data,
      isActive: true,
      color: bgColor,
      isPrivate,
      memberKeys: selectedMembers.map((sc) => sc.key) as string[],
    };
    setModal({ ...modal, open: false });
    setIsLoading(true);

    let response;
    if (editingGroup) {
      response = await WorkgroupService.modifyWorkgroup({
        ...editingGroup,
        ...data,
      });
    } else {
      response = await WorkgroupService.createWorkgroup(data);
    }
    setIsLoading(false);

    if (response.result === "OK") {
      setSnackbar({
        ...snackbar,
        open: true,
        message: `Grupo de trabajo ${
          editingGroup ? "modificado" : "creado"
        } exitosamente!`,
        severity: "success",
      });
    } else {
      setSnackbar({
        ...snackbar,
        open: true,
        message: response.errorMessage as string,
        severity: "error",
      });
    }
  };

  const handleSelectedUsersChange = (options: AutocompleteField) => {
    if (
      options &&
      options.key &&
      !selectedMembers.some((u) => u.key === options.key)
    ) {
      setSelectedMembers([...selectedMembers, options]);
      setAvailableMembers(
        availableMembers.filter((au) => au.key !== options.key)
      );
    }
  };

  const handleDeleteMember = (key: string) => {
    if (!availableMembers.some((u) => u.key === key)) {
      setAvailableMembers([
        ...availableMembers,
        ...selectedMembers.filter((su) => su.key === key),
      ]);
      setSelectedMembers(selectedMembers.filter((su) => su.key !== key));
    }
  };

  const handleColorChange = (color: ColorResult) => {
    setBgColor(color.hex);
    setShowColorPicker(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}>
      <Stack spacing={2} width={"100%"}>
        <div className="wg-name">
          <div className="wg-icon" style={{ backgroundColor: bgColor }}>
            <Button
              onClick={() => setShowColorPicker(true)}
              sx={{ color: "white" }}
            >
              G
            </Button>
            <ColorPickerComponent
              visible={showColorPicker}
              handleChange={handleColorChange}
            />
          </div>
          <TextField
            label="Nombre"
            type="text"
            {...register("name", { required: true })}
            variant="standard"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message as string}
            autoCapitalize="words"
            required
            placeholder="P. ej. marketing, ingeniería, RRHH"
          />
        </div>
        <TextField
          label="Descripción (opcional)"
          type="text"
          {...register("description")}
          variant="standard"
          fullWidth
          autoCapitalize="sentences"
        />
        <div className="private">
          <div className="text">
            <div className="text__title">Hacer Privado</div>
            <p className="text__content">
              Solo tu y los colaboradores invitados tienen acceso
            </p>
          </div>
          <Switch
            defaultChecked={isPrivate}
            value={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
          />
        </div>
        {isPrivate && (
          <>
            <div style={{ maxWidth: "500px" }}>
              <div className="text__title">Colaboradores seleccionados:</div>
              <br />
              <div className="selected-colaborators">
                {selectedMembers.map(({ key, label }) => (
                  <div key={key} className="selected-chip">
                    <Chip
                      key={key}
                      className="selected-chip"
                      size="small"
                      color="success"
                      label={label}
                      onDelete={() => handleDeleteMember(key as string)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <Autocomplete
              options={availableMembers}
              includeInputInList
              fullWidth
              onChange={(_, options) => {
                handleSelectedUsersChange(options as AutocompleteField);
                setValue("colaborators", "");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="colaborators"
                  label="Agrega Colaboradores"
                  type="text"
                  variant="standard"
                  fullWidth
                  error={!!errors.location}
                  helperText={errors.location?.message as string}
                  autoCapitalize="words"
                />
              )}
            />
          </>
        )}

        <Button
          fullWidth
          type="submit"
          variant="outlined"
          size="large"
          color="success"
        >
          {editingGroup ? "Modificar Grupo" : "Crear Grupo"}
        </Button>
      </Stack>
    </form>
  );
};
