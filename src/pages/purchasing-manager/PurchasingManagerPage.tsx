import { useAuthStore } from "../../stores";
import { UnauthorizedPage } from "../unauthorized/UnauthorizedPage";
import { ComercialContainer } from "../../components/comercial-container/ComercialContainer";
import { ProviderContainer } from "../../components/provider-container/ProviderContainer";

export const PurchasingManagerPage = () => {
  const user = useAuthStore((state) => state.user);

  if (
    !user?.permissions?.includes("PURCHASE") &&
    !user?.permissions?.includes("PROVIDER")
  )
    return <UnauthorizedPage />;

  return (
      <div className="purchase-container" style={{ width: "100%" }}>
        {user?.permissions?.includes("PURCHASE") && <ComercialContainer />}
        {user?.permissions?.includes("PROVIDER") && <ProviderContainer />}
      </div>
  );
};
