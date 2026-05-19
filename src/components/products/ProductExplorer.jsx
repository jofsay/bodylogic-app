import ProductFilters from './ProductFilters';
import ProductCard from './ProductCard';
import ProductTable from './ProductTable';

export default function ProductExplorer({ order, descuentoActivo, perfilUsuario }) {
  const esVentas = perfilUsuario === 'ventas';
  return (
    <>
      <ProductFilters {...order} esVentas={esVentas} />
      {order.vista === 'tabla' ? (
        <ProductTable filas={order.filasVisibles} totales={order.totales} onCantidad={order.cambiarCantidad} descuentoActivo={descuentoActivo} esVentas={esVentas} />
      ) : (
        <div className="products-grid">
          {order.filasVisibles.map((p) => <ProductCard key={p.codigo} producto={p} onCantidad={order.cambiarCantidad} esVentas={esVentas} />)}
        </div>
      )}
    </>
  );
}
