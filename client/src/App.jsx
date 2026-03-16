import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PipelineBoard from './components/PipelineBoard';
import OrganizationsList from './components/OrganizationsList';
import OrganizationDetail from './components/OrganizationDetail';
import PeopleList from './components/PeopleList';
import ClosedDeals from './components/ClosedDeals';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PipelineBoard />} />
        <Route path="/organizations" element={<OrganizationsList />} />
        <Route path="/organizations/:id" element={<OrganizationDetail />} />
        <Route path="/people" element={<PeopleList />} />
        <Route path="/closed-deals" element={<ClosedDeals />} />
      </Routes>
    </Layout>
  );
}
