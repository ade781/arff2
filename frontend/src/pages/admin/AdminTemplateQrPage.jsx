import React from 'react';
import { useOutletContext } from 'react-router-dom';
import TemplateQrView from '../../components/equipment/TemplateQrView';

export default function AdminTemplateQrPage() {
  const { items } = useOutletContext();

  return (
    <div className="space-y-4">
      <TemplateQrView items={items} />
    </div>
  );
}
