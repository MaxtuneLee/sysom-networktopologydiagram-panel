import React, { useEffect, useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { NetWorkTopologyDiagramOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2, LinkButton } from '@grafana/ui';
import Graphin, { Behaviors, Components, TooltipValue } from '@antv/graphin';
import { transformDataFrameToG6Format } from 'utils';
import './NetworkTopologyPanel.css';

interface Props extends PanelProps<NetWorkTopologyDiagramOptions> {}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
    `,
  };
};

//antv graphin components
const { Tooltip } = Components;

export const NetworkTopologyPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const { DragNode, ActivateRelations, Hoverable } = Behaviors;
  const styles = useStyles2(getStyles);

  // 直接控制 Graphin 的 graph 来控制 g6 渲染
  const canvasRef = useRef<Graphin>(null);
  useEffect(() => {
    if (canvasRef.current) {
      // update canvas size dynamically
      canvasRef.current.graph.changeSize(width, height);
    }
  }, [width, height]);

  // Convert grafana DataFrame to G6 format
  let g6data = transformDataFrameToG6Format(data.series, options);

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: 100%;
          height: 100%;
        `
      )}
    >
      <Graphin
        width={width}
        height={height}
        data={g6data}
        theme={{ mode: 'dark' }}
        layout={{ type: 'dagre', preventOverlap: true, linkDistance: 200 }}
        minZoom={0.6}
        fitCenter={true}
        ref={canvasRef}
      >
        <Hoverable bindType="node" />
        <Hoverable bindType="edge" />
        <DragNode disabled />
        <ActivateRelations trigger="mouseenter" />
        <Tooltip bindType="edge">
          {(value: TooltipValue) => {
            if (value.model) {
              const { model } = value;
              // 写了大量内联样式，因为使用 className 导致 dom 直接不渲染，未知原因
              // 应该和 graphin 实现有关系，之后再研究
              return (
                <div
                  style={{
                    borderRadius: '10px',
                    background: '#111217',
                    padding: '0.6rem',
                    marginBottom: '10px',
                    width: 'auto',
                  }}
                >
                  {(model.detail as any).map((value: any, index: number) => {
                    return (
                      <>
                        <div className="tooltip-title">{value.key}</div>
                        <div>
                          {value.type === 'number' ? `${value.value} ${options.numberDetailUnit}` : value.value}
                        </div>
                      </>
                    );
                  })}
                </div>
              );
            }
            return null;
          }}
        </Tooltip>
        <Tooltip bindType="node">
          {(value: TooltipValue) => {
            if (value.model) {
              const { model } = value;
              return (
                <div
                  style={{
                    boxSizing: 'border-box',
                    borderRadius: '10px',
                    background: '#111217',
                    padding: '0.6rem',
                    marginBottom: '10px',
                    width: 'fit-content',
                  }}
                >
                  {(model.detail as any).map((value: any, index: number) => {
                    return (
                      <>
                        <div className="tooltip-title">{value.key}</div>
                        <div>
                          {value.type === 'number' ? `${value.value} ${options.edgeNumberDetailUnit}` : value.value}
                        </div>
                      </>
                    );
                  })}
                  <LinkButton
                    style={{ marginTop: '12px' }}
                    variant="secondary"
                    href={options.jumpButtonURL.split('$')[0] + model.button}
                  >
                    {options.jumpButtonTitle}
                  </LinkButton>
                </div>
              );
            }
            return null;
          }}
        </Tooltip>
      </Graphin>
    </div>
  );
};
