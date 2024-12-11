import { IconButton } from "@mui/material";
import { createContext, useEffect, useState } from "react";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { UsersService } from "../../services/users.service";
import { useAuhtStore } from "../../stores";
import { useUiStore } from "../../stores/ui/ui.store";

// Create a context to manage the script loading state
const CloudinaryScriptContext = createContext<unknown>({});

function CloudinaryUploadWidget({
  uwConfig,
  color = "black",
}: {
  uwConfig: unknown;
  color?: string;
  isXLS?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const currentUser = useAuhtStore((state) => state.user);
  const setSnackbar = useUiStore((state) => state.setSnackbar);

  useEffect(() => {
    // Check if the script is already loaded
    if (!loaded) {
      const uwScript = document.getElementById("uw");
      if (!uwScript) {
        // If not loaded, create and load the script
        const script = document.createElement("script");
        script.setAttribute("async", "");
        script.setAttribute("id", "uw");
        script.src = "https://upload-widget.cloudinary.com/global/all.js";
        script.addEventListener("load", () => setLoaded(true));
        document.body.appendChild(script);
      } else {
        // If already loaded, update the state
        setLoaded(true);
      }
    }
  }, [loaded]);

  const initializeCloudinaryWidget = () => {
    if (loaded && currentUser) {
      const myWidget = window.cloudinary?.createUploadWidget(
        uwConfig,
        async (
          error: unknown,
          result: { event: string; info: { url: string } },
        ) => {
          if (!error && result && result.event === "success") {
              currentUser.avatarURL = result.info.url as string;
              const resp = await UsersService.modifyUser(currentUser);

            if (resp.result === "OK") {
              setSnackbar({
                open: true,
                message: "Foto cargada exitosamente!",
                severity: "success",
              });
            } else {
              setSnackbar({
                open: true,
                message: "Error cargando foto!",
                severity: "error",
              });
            }
          }

          if (error) console.error({ error });
        }
      );

      document.getElementById("upload_widget")?.addEventListener(
        "click",
        function () {
          myWidget?.open();
        },
        false
      );
    }
  };

  return (
    <CloudinaryScriptContext.Provider value={{ loaded }}>
      <IconButton id="upload_widget" onClick={initializeCloudinaryWidget}>
        <CloudUploadOutlinedIcon sx={{ color }} />
      </IconButton>
    </CloudinaryScriptContext.Provider>
  );
}

export default CloudinaryUploadWidget;
export { CloudinaryScriptContext };
