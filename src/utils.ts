/* eslint-disable @typescript-eslint/no-unused-expressions */
import { EdgeStyle } from '@antv/graphin';
import { DataFrame } from '@grafana/data';
import { ColorScheme, Edges, NetWorkTopologyDiagramOptions, Nodes } from 'types';

/**
 * 转换 dataFrame 至 G6 格式
 * @param dataFrame grafana dataFrame
 * @param options panel options
 * @returns 已转换的 G6 格式，包含 node 和 edge
 */
export const transformDataFrameToG6Format = (dataFrame: DataFrame[], options: NetWorkTopologyDiagramOptions) => {
  const nodes: Nodes[] = [];
  const edges: Edges[] = [];
  const details: Array<{ id: number; detail: Nodes['detail'] }> = [];
  //储存 detail 对应的 index
  const nodeDetails: number[] = [];
  const edgeDetails: number[] = [];
  const extraDetails: number[] = [];
  const colorScheme: ColorScheme[] = [];
  //储存 btn 对应的 index
  let nodeBtn: number[] = [];
  const animation: EdgeStyle['animate'] = {
    type: 'circle-running',
    color: 'orange',
    repeat: true,
    duration: 6000,
  };
  const [splitNodes, splitEdges, splitDetails] = frameSplit(dataFrame);

  // console.log(splitNodes, splitEdges, splitDetails);
  splitDetails.fields.map((field, index) => {
    field.name.slice(0, 8) === 'detail__' ? extraDetails.push(index) : null;
    field.name.slice(0, 5) === 'color' ? null : null;
  });
  (splitDetails.fields.find((field) => field.name === 'id') as any)?.values.buffer.map((value: any, index: number) => {
    const id = value;
    const detail = extraDetails.map((item) => {
      return {
        key: splitDetails.fields[item].name.split('__')[2],
        value: (splitDetails.fields[item].values as any).buffer[index],
        type: splitDetails.fields[item].name.split('__')[1] as 'string' | 'number',
      };
    });
    details.push({
      id: id,
      detail: detail,
    });
  });

  //边相关操作
  //找到 detail 对应的 index 并存起来
  splitEdges.fields.map((field, index) => {
    field.name.slice(0, 8) === 'detail__' ? edgeDetails.push(index) : null;
  });
  (splitEdges.fields.find((field) => field.name === 'id') as any).values.buffer.map((value: any, index: number) => {
    const id = value;
    const source = getValueByFiledNameAndIdx(splitEdges, 'source', index);
    const target = getValueByFiledNameAndIdx(splitEdges, 'target', index);
    const detail = edgeDetails.map((item) => {
      return {
        key: splitEdges.fields[item].name.split('__')[2],
        value: (splitEdges.fields[item].values as any).buffer[index],
        type: splitEdges.fields[item].name.split('__')[1] as 'string' | 'number',
      };
    });
    // 自环边不需要动画
    edges.push(
      source !== target
        ? {
            id: id,
            source: source,
            target: target,
            detail: detail,
            style: {
              animate: animation,
            },
          }
        : {
            id: id,
            source: source,
            target: target,
            detail: detail,
          }
    );
  });

  //节点相关操作
  splitNodes.fields.map((field, index) => {
    field.name.slice(0, 8) === 'detail__' ? nodeDetails.push(index) : null;
    field.name.slice(0, 5) === 'btn__' ? nodeBtn.push(index) : null;
  });

  (splitNodes.fields.find((field) => field.name === 'id') as any).values.buffer.map((value: any, index: number) => {
    const id = getValueByFiledNameAndIdx(splitNodes, 'id', index);
    const title = getValueByFiledNameAndIdx(splitNodes, 'title', index);
    const inner_title = getValueByFiledNameAndIdx(splitNodes, 'inner_title', index);
    const subtitle = getValueByFiledNameAndIdx(splitNodes, 'sub_title', index);
    const detail = nodeDetails.map((item) => {
      return {
        key: splitNodes.fields[item].name.split('__')[2],
        value: (splitNodes.fields[item].values as any).buffer[index],
        type: splitNodes.fields[item].name.split('__')[1] as 'string' | 'number',
      };
    });
    const otherDetail = details.find((item) => item.id === id);
    const button = nodeBtn.map((item) => {
      return {
        key: splitNodes.fields[item].name.split('__')[1],
        value: (splitNodes.fields[item].values as any).buffer[index],
      };
    });
    console.log(otherDetail !== undefined ? [...detail, ...otherDetail.detail] : detail);
    nodes.push({
      id: id,
      title: title,
      inner_title: inner_title,
      subtitle: subtitle,
      detail: otherDetail !== undefined ? [...detail, ...otherDetail.detail] : detail,
      button: button,
      style: {
        keyshape: {
          size: 80,
          fill: 'orange',
          stroke: 'orange',
        },
        label: { value: `${splitString(30, title)}\n${subtitle}` },
        icon: {
          value: `${inner_title} ${options.innerTitleUnit || ''}`,
        },
      },
    });
  });

  return { edges, nodes };
};

/**
 * 将dataframe分成nodes和edges以及details后返回
 * @param dataFrame
 * @returns node，edge，detail
 */
export const frameSplit = (dataFrame: DataFrame[]) => {
  const initFrame: DataFrame = {
    fields: [],
    name: '',
    length: 0,
  };
  let nodes: DataFrame = initFrame;
  let edges: DataFrame = initFrame;
  let details: DataFrame = initFrame;
  dataFrame.forEach((frame) => {
    //有souce字段的是edge
    frame.fields.find((field) => field.name === 'source') ? (edges = frame) : null;
    //有title字段的是node
    frame.fields.find((field) => field.name === 'title') ? (nodes = frame) : null;
    //含有detail字段并且不含有title字段的是detail
    frame.fields.find((field) => field.name.slice(0, 8) === 'detail__') &&
    frame.fields.find((field) => field.name === 'title') === undefined
      ? (details = frame)
      : null;
  });
  return [nodes, edges, details];
};

/**
 * 通过字段名和索引获取值
 * @param frame 表
 * @param fieldName 字段名
 * @param idx 索引
 * @param default_value 默认值
 * @returns 值
 */
export const getValueByFiledNameAndIdx = (frame: DataFrame, fieldName: string, idx: number, default_value = '') => {
  let field = frame.fields.find((value: any) => {
    return value.name.trim() === fieldName;
  });
  if (field) {
    return (field.values as any).buffer[idx];
  }
  return default_value;
};

/**
 * 隔几个字符加一个换行（因为g6没提供调整label宽度的方法所以只能暴力点了）
 * @param length 隔几个长度
 * @param str 要切割的字符串
 * @returns 换好了行的字符串
 */
function splitString(length: number, str: string) {
  let reg = new RegExp('[^\n]{1,' + length + '}', 'g');
  let res = str.match(reg);
  return res?.join('\n');
}

export const setColorScheme = (field: DataFrame['fields']) => {};
