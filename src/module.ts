import { PanelPlugin } from '@grafana/data';
import { NetWorkTopologyDiagramOptions } from './types';
import { NetworkTopologyPanel } from './components/NetworkTopologyPanel';

export const plugin = new PanelPlugin<NetWorkTopologyDiagramOptions>(NetworkTopologyPanel).setPanelOptions((builder) => {
  return builder
    .addUnitPicker({
      path: 'numberDetailUnit',
      name: 'Number detail unit',
      description: '每个数值类型描述的单位',
      category: ['Node Options'],
      defaultValue: '',
    })
    .addUnitPicker({
      path: 'innerTitleUnit',
      name: 'Inner title unit',
      description: '节点内部展示信息单位',
      category: ['Node Options'],
      defaultValue: '',
    })
    .addTextInput({
      path: 'jumpButtonTitle',
      name: 'Jump button title',
      description: '节点悬浮窗跳转按钮的显示名字',
      category: ['Node Options'],
      defaultValue: '跳转到节点面板',
    })
    .addTextInput({
      path: 'jumpButtonURL',
      name: 'Jump button URL',
      description: '节点悬浮窗跳转按钮的URL',
      category: ['Node Options'],
      defaultValue: '/grafana/d/Ua6tURa4k/new-dashboard?pod=$pod_name',
    })
    .addUnitPicker({
      path: 'edgeNumberDetailUnit',
      name: 'Number detail unit',
      description: '悬浮窗每个数值类型描述的单位',
      category: ['Edge Options'],
      defaultValue: '',
    });
});
