import { useAuhtStore } from "../../stores";
import { UnauthorizedPage } from "../unauthorized/UnauthorizedPage";

export const PurchasingManagerPage = () => {
  const user = useAuhtStore((state) => state.user);

  if (!user?.permissions.includes("PURCHASE")) return <UnauthorizedPage />;
  
  return <div>Proximamente ...</div>;
};
