import React, { useEffect, useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { NetWorkTopologyDiagramOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2, LinkButton } from '@grafana/ui';
import Graphin, { Behaviors, Components, TooltipValue } from '@antv/graphin';
import { transformDataFrameToG6Format } from 'utils';
import './NetworkTopologyPanel.css';

interface Props extends PanelProps<NetWorkTopologyDiagramOptions> { }

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
  const { DragNode, ActivateRelations, Hoverable, ZoomCanvas } = Behaviors;
  const styles = useStyles2(getStyles);
  // 直接控制 Graphin 的 graph 来控制 g6 渲染
  const canvasRef = useRef<Graphin>(null);

  /**
   * canvas zoom in
   */
  const zoomIn = () => {
    if (canvasRef.current) {
      const graph = canvasRef.current.graph;
      graph.zoom(1.2, { x: graph.getWidth() / 2, y: graph.getHeight() / 2 }, true, {
        duration: 500,
        easing: 'easeCubic',
      });
    }
  };
  /**
   * canvas zoom out
   */
  const zoomOut = () => {
    if (canvasRef.current) {
      const graph = canvasRef.current.graph;
      graph.zoom(0.8, { x: graph.getWidth() / 2, y: graph.getHeight() / 2 }, true, {
        duration: 500,
        easing: 'easeCubic',
      });
    }
  };
  /**
   * canvas fit view
   */
  const canvasFitView = () => {
    if (canvasRef.current) {
      const graph = canvasRef.current.graph;
      graph.fitView(undefined, undefined, true, {
        duration: 500,
        easing: 'easeCubic',
      });
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      // update canvas size dynamically
      canvasRef.current.graph.changeSize(width, height);
    }
  }, [width, height]);

  // self define behavior to hightlight related node
  useEffect(() => {
    if (canvasRef.current) {
      options.hightlightRelatedNode
        ? canvasRef.current.graph.addBehaviors(
          {
            type: 'activate-relations',
            trigger: 'mouseenter',
            activeState: 'active',
            inactiveState: 'inactive',
            resetSelected: false,
          },
          'default'
        )
        : canvasRef.current.graph.removeBehaviors('active-relations', 'default');
      //解决拖影问题
      canvasRef.current.graph.get('canvas').set('localRefresh', false)
    }
  }, [options.hightlightRelatedNode]);

  // console.log('origin data: ', data.series)

  // Convert grafana DataFrame to G6 format
  let g6data = transformDataFrameToG6Format(data.series, options);

  // console.log('g6data: ', g6data)

  // get dynamic template url
  let getTemplateURL = (model: any) => {
    let retURL = options.jumpButtonURL
    // 只替换有匹配的模板变量
    model.button.map((item: { key: string; value: string }) => {
      const check = options.jumpButtonURL.search('$' + item.key)
      if (check) {
        retURL = retURL.replace('$' + item.key, item.value)
      }
    })
    return retURL
  }

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
      <div className="canvas-toolbar">
        <div className="toolbar-item canvas-zoomin" onClick={zoomIn} title="放大"></div>
        <div className="toolbar-item canvas-zoomout" onClick={zoomOut} title="缩小"></div>
        <div className="toolbar-item canvas-fit" onClick={canvasFitView} title="自适应视图"></div>
      </div>
      <Graphin
        width={width}
        height={height}
        data={g6data}
        theme={{ mode: 'dark' }}
        layout={{ type: 'dagre', preventOverlap: true, linkDistance: 200 }}
        zoom={1}
        minZoom={0.6}
        animate={true}
        fitCenter={true}
        ref={canvasRef}
      >
        <Hoverable bindType="node" />
        <Hoverable bindType="edge" />
        <ZoomCanvas disabled />
        <DragNode />
        <ActivateRelations trigger="mouseenter" disabled={!options.hightlightRelatedNode} />
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
                    href={getTemplateURL(model)}
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
