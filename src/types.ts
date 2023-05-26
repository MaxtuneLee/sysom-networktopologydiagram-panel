export interface NetWorkTopologyDiagramOptions {
  hightlightRelatedNode: boolean;
  numberDetailUnit: string;
  innerTitleUnit: string;
  jumpButtonTitle: string;
  jumpButtonURL: string;

  edgeNumberDetailUnit: string;
}

/**
 * 节点格式
 */
export interface Nodes {
  /**
   * 节点唯一标识
   */
  id: string;
  /**
   * 节点标题
   */
  title: string;
  /**
   * 节点内部标题
   */
  inner_title: string;
  /**
   * 节点额外描述
   */
  subtitle: string;
  /**
   * 节点详情（悬浮窗显示）
   */
  detail: Array<{
    /**
     * 详情标题
     */
    key: string;
    /**
     * 详情值
     */
    value: string;
    /**
     * 详情值类型
     */
    type: 'string' | 'number';
  }>;
  /**
   * 节点跳转配置
   */
  btn: {
    /**
     * 跳转链接模版变量名
     * 如 pod_name 对应 `/grafana/d/Ua6tURa4k/new-dashboard?pod=${pod_name}` 中填充的模板字符串
     */
    key: string;
    /**
     * 跳转链接模版变量值
     */
    value: string;
  }|{};
}

/**
 * 边格式
 */
export interface Edges {
  /**
   * 边唯一标识
   */
  id: string;
  /**
   * 边起始节点
   */
  source: string;
  /**
   * 边终止节点
   */
  target: string;
  /**
   * 边详情，同节点详情（悬浮窗显示）
   */
  detail: Array<{
    key: string;
    value: string;
    type: 'string' | 'number';
  }>;
}
