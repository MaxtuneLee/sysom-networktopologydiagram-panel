/* eslint-disable @typescript-eslint/no-unused-expressions */
import { DataFrame } from '@grafana/data';
import { NetWorkTopologyDiagramOptions } from 'types';


/**
 * 转换 dataFrame 至 G6 格式
 * @param dataFrame grafana dataFrame
 * @param options panel options
 * @returns 已转换的 G6 格式，包含 node 和 edge
 */
export const transformDataFrameToG6Format = (dataFrame: DataFrame[], options: NetWorkTopologyDiagramOptions) => {
  const nodes: any[] = [];
  const edges: any[] = [];
  const animation = {
    style: {
      animate: {
        type: 'circle-running',
        color: 'orange',
        repeat: true,
        duration: 6000,
      },
    },
  };
  dataFrame.forEach((frame) => {
    //储存 detail 对应的 index
    const nodeDetails: number[] = [];
    const edgeDetails: number[] = [];
    //储存 btn 对应的 index
    let nodeBtn: number[] = [];

    //将 edges 和 nodes 区分处理
    const edgesCheck = frame.fields.find((field) => field.name === 'source');

    const getValueByFiledNameAndIdx = (fieldName: string, idx: number, default_value = "") => {
      let field = frame.fields.find((value: any) => {
        return value.name.trim() === fieldName;
      });
      if (field) {
        return (field.values as any).buffer[idx];
      }
      return default_value;
    }

    // 如果当前的 frame 是 edges
    if (edgesCheck) {
      //找到 detail 对应的 index 并存起来
      frame.fields.map((field, index) => {
        field.name.slice(0, 8) === 'detail__' ? edgeDetails.push(index) : null;
      });

      (frame.fields[0].values as any).buffer.map((value: any, index: number) => {
        const id = value;
        const source = getValueByFiledNameAndIdx("source", index)
        const target = getValueByFiledNameAndIdx("target", index)
        const detail = edgeDetails.map((item) => {
          return {
            key: frame.fields[item].name.split('__')[2],
            value: (frame.fields[item].values as any).buffer[index],
            type: frame.fields[item].name.split('__')[1],
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
              ...animation,
            }
            : {
              id: id,
              source: source,
              target: target,
              detail: detail,
            }
        );
      });
    } else {
      frame.fields.map((field, index) => {
        field.name.slice(0, 8) === 'detail__' ? nodeDetails.push(index) : null;
        field.name.slice(0, 5) === 'btn__' ? (nodeBtn.push(index)) : null;
      });

      (frame.fields[0].values as any).buffer.map((value: any, index: number) => {
        const id = getValueByFiledNameAndIdx("id", index);
        const title = getValueByFiledNameAndIdx("title", index);
        const inner_title = getValueByFiledNameAndIdx("inner_title", index);
        const subtitle = getValueByFiledNameAndIdx("sub_title", index);
        const detail = nodeDetails.map((item) => {
          return {
            key: frame.fields[item].name.split('__')[2],
            value: (frame.fields[item].values as any).buffer[index],
            type: frame.fields[item].name.split('__')[1],
          };
        });
        const button = nodeBtn.map((item) => {
          return {
            key: frame.fields[item].name.split('__')[1],
            value: (frame.fields[item].values as any).buffer[index],
          };
        });

        nodes.push({
          id: id,
          title: title,
          inner_title: inner_title,
          subtitle: subtitle,
          detail: detail,
          button: button,
          style: {
            keyshape: {
              size: 80,
              fill: 'orange',
              stroke: 'orange',
            },
            label: { value: `${title}\n${subtitle}` },
            icon: {
              value: `${inner_title} ${options.innerTitleUnit || ''}`,
            },
          },
        });
      });
    }
  });

  return { edges, nodes };
};
