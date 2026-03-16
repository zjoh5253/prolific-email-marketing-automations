import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { api } from '../api';
import { PIPELINE_STAGES, tempColor, formatCurrency, daysSince } from './constants';
import DealDrawer from './DealDrawer';
import DealForm from './DealForm';
import Modal from './Modal';

function DraggableCard({ deal, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(deal.id),
    data: deal,
  });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''}`}
      onClick={(e) => { e.stopPropagation(); onClick(deal); }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${tempColor(deal.lead_temperature)}`} />
        <span className="text-sm font-medium text-gray-900 truncate">{deal.company_name}</span>
      </div>
      <div className="text-xs text-gray-500 truncate mb-2">{deal.deal_name}</div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">{formatCurrency(deal.deal_value)}</span>
        <span className="text-xs text-gray-400">{daysSince(deal.updated_at)}d</span>
      </div>
    </div>
  );
}

function DroppableColumn({ stage, deals, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = deals.reduce((s, d) => s + (d.deal_value || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-64 flex flex-col bg-gray-100 rounded-lg ${isOver ? 'ring-2 ring-indigo-400' : ''}`}
    >
      <div className="px-3 py-2.5 border-b border-gray-200">
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide truncate">{stage}</div>
        <div className="text-xs text-gray-500 mt-0.5">{deals.length} deals &middot; {formatCurrency(total)}</div>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
        {deals.map((deal) => (
          <DraggableCard key={deal.id} deal={deal} onClick={onCardClick} />
        ))}
      </div>
    </div>
  );
}

export default function PipelineBoard() {
  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeDrag, setActiveDrag] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = () => api.getDeals({ closed: 'false' }).then(setDeals);
  useEffect(() => { load(); }, []);

  const handleDragStart = (event) => {
    setActiveDrag(deals.find((d) => String(d.id) === event.active.id));
  };

  const handleDragEnd = async (event) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;
    const stage = over.id;
    const dealId = active.id;
    if (!PIPELINE_STAGES.includes(stage)) return;
    const deal = deals.find((d) => String(d.id) === dealId);
    if (!deal || deal.pipeline_stage === stage) return;
    setDeals((prev) => prev.map((d) => (String(d.id) === dealId ? { ...d, pipeline_stage: stage } : d)));
    await api.updateDealStage(dealId, stage);
    load();
  };

  const handleDealSaved = () => {
    load();
    setSelectedDeal(null);
    setShowCreate(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Deal
        </button>
      </div>
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-3 h-full pipeline-columns">
            {PIPELINE_STAGES.map((stage) => (
              <DroppableColumn
                key={stage}
                stage={stage}
                deals={deals.filter((d) => d.pipeline_stage === stage)}
                onCardClick={(deal) => setSelectedDeal(deal)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeDrag ? (
              <div className="bg-white rounded-lg p-3 shadow-lg border border-indigo-300 w-60 rotate-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${tempColor(activeDrag.lead_temperature)}`} />
                  <span className="text-sm font-medium">{activeDrag.company_name}</span>
                </div>
                <div className="text-sm font-semibold">{formatCurrency(activeDrag.deal_value)}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedDeal && (
        <DealDrawer dealId={selectedDeal.id} onClose={() => setSelectedDeal(null)} onSaved={handleDealSaved} />
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Deal">
        <DealForm onSaved={handleDealSaved} onCancel={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
}
