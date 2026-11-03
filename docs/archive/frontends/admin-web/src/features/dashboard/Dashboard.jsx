import { Link, useNavigate } from 'react-router-dom';
import { Badge, BarChart, Card, Donut, PageHead, StatCard } from '../../shared/ui/Ui.jsx';
import { weeklySignups } from '../../shared/mock.js';
import { useStore } from '../../shared/store.jsx';

export default function Dashboard() {
  const { users } = useStore();
  const navigate = useNavigate();

  return (
    <>
      <PageHead
        crumb="Quản trị / Tổng quan"
        title="Tổng quan"
        subtitle="Theo dõi sức khỏe cộng đồng và các tài khoản cần hỗ trợ."
      />
      <div className="grid c4">
        <StatCard icon="users" value="12.480" label="Tổng người dùng" note="+8,2% tháng này" />
        <StatCard icon="trend" value="9.842" label="Đang hoạt động" note="78,9% tổng số" noteTone="green" />
        <StatCard icon="plus" value="312" label="Người dùng mới" note="7 ngày gần đây" noteTone="pink" />
        <StatCard icon="alert" value="18" label="Cần xem xét" note="Tài khoản" noteTone="amber" />
      </div>

      <div className="grid split" style={{ marginTop: 18 }}>
        <Card
          title="Tăng trưởng người dùng"
          subtitle="Số tài khoản mới trong 7 ngày"
          action={<span className="badge purple">7 ngày qua</span>}
        >
          <BarChart data={weeklySignups} />
        </Card>
        <Card title="Trạng thái tài khoản" subtitle="Phân bổ trạng thái hiện tại">
          <Donut
            centerValue="78,9%"
            centerLabel="Hoạt động"
            segments={[
              { label: 'Hoạt động', value: 78.9, color: '#9440dd' },
              { label: 'Tạm khóa', value: 6.1, color: '#db607e' },
              { label: 'Khác', value: 15, color: '#c9a8f4' },
            ]}
          />
        </Card>
      </div>

      <Card
        className="mt"
        title="Người dùng mới"
        action={<Link className="link" to="/users">Xem tất cả ›</Link>}
      >
        <table>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Ngày tham gia</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 3).map((u) => (
              <tr key={u.id} className="clickable" onClick={() => navigate(`/users/${u.id}`)}>
                <td className="strong">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.joined}</td>
                <td><Badge>{u.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
