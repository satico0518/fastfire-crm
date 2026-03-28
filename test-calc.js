const formData = {
  compras: [
    { valor: "325234", detalle: "dgr grt" }
  ]
};
const calculateSum = "compras.valor";
const parts = calculateSum.split(".");
const arr = formData[parts[0]];
let total = 0;
if (Array.isArray(arr)) {
  total = arr.reduce((acc, curr) => {
    const val = Number(curr[parts[1]]);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
}
console.log("Total:", total);
