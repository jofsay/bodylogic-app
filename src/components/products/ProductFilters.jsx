import { Button, Card } from '../shared';

export default function ProductFilters({ categorias, categoria, setCategoria, busqueda, setBusqueda, vista, setVista, esVentas }) {
  return (
    <Card className="filters">
      <div className="filters-top">
        <div>
          <h2>{esVentas ? 'Catálogo de venta' : 'Catálogo calculable'}</h2>
          <p className="hint">
            {esVentas
              ? 'Captura unidades para generar una nota simple al cliente con precios y total de compra. Los puntos quedan ocultos para el cliente.'
              : 'Captura unidades en tarjetas o tabla; todo se sincroniza con Pedido actual.'}
          </p>
        </div>
        <div className="segmented">
          <Button variant={vista === 'tarjetas' ? 'primary' : 'ghost'} onClick={() => setVista('tarjetas')}>Tarjetas</Button>
          <Button variant={vista === 'tabla' ? 'primary' : 'ghost'} onClick={() => setVista('tabla')}>Tabla</Button>
        </div>
      </div>
      <input className="input search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por producto, código, contenido o categoría..." />
      <div className="category-row">{categorias.map((c) => <Button key={c} variant={categoria === c ? 'primary' : 'ghost'} onClick={() => setCategoria(c)}>{c}</Button>)}</div>
    </Card>
  );
}
