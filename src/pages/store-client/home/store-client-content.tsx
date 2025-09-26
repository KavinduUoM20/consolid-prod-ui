import {
  FeaturedProducts,
  Search,
  SpecialOffers,
} from './components';

export function StoreClientContent() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Search />
      <FeaturedProducts />
      <SpecialOffers />
    </div>
  );
}
