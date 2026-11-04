import { Link } from 'react-router-dom';
import { ButtonLink, Card, ItemTile, Notice, Spinner } from '../../shared/ui/index';
import { useWardrobe } from '../../../hooks/user/wardrobe/api';

/** Tóm tắt tủ đồ trên trang chủ. */
export function WardrobeSummary() {
  const items = useWardrobe();
  const pending = items.data?.filter((i) => i.status === 'PENDING_REVIEW').length ?? 0;

  return (
    <Card>
      <div className="spread">
        <h2>Tủ đồ</h2>
        <Link to="/wardrobe" className="small">
          Xem tất cả
        </Link>
      </div>
      {items.isError ? <Notice tone="error">Chưa tải được tủ đồ. <button className="chip" onClick={() => void items.refetch()}>Thử lại</button></Notice> : items.isPending ? (
        <Spinner />
      ) : (
        <>
          <p className="muted">
            {items.data?.length ?? 0} món{pending > 0 ? ` · ${pending} món chờ bạn xác nhận` : ''}
          </p>
          <div className="grid-tiles">
            {items.data?.slice(0, 6).map((i) => (
              <Link key={i.id} to={`/wardrobe/${i.id}`}><ItemTile category={i.category} imageUrl={i.imageUrl} /></Link>
            ))}
          </div>
          <div>
            <ButtonLink to="/wardrobe/add" kind="ghost" small>
              + Thêm món
            </ButtonLink>
          </div>
        </>
      )}
    </Card>
  );
}
