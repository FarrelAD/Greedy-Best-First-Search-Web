document.addEventListener('alpine:init', () => {
    Alpine.data('mainComponent', () => ({
        nodeTooltip: null,
        selectedNode: null,
        circleNodes: null,
        links: null,
        linkLabels: null,
        init() {
            this.nodeTooltip = document.getElementById('node-tooltip');

            this.$watch(
                () => this.$store.nodes.startNode,
                (val, oldVal) => {
                    if (val === oldVal || val == null) return;

                    this.updateNode(val, oldVal, 'start')
                }
            );

            this.$watch(
                () => this.$store.nodes.endNode,
                (val, oldVal) => {
                    if (val === oldVal || val == null) return;

                    this.updateNode(val, oldVal, 'end')
                }
            );
        },
        createGraph() {
            const nodes = this.$store.nodes.nodesData;
    
            const svg = d3.select('#graph-svg');
            const bbox = svg.node().getBoundingClientRect();

            const simulation = d3.forceSimulation(nodes)
                .force('link', d3.forceLink(this.$store.links.linksData).id(d => d.name).distance(1))
                .force('charge', d3.forceManyBody().strength(0))
                .force('center', d3.forceCenter(bbox.width / 2, bbox.height / 2))
                .stop();

            this.links = svg.selectAll('.link')
                .data(this.$store.links.linksData)
                .enter()
                .append('line')
                .attr('class', 'link')
                .attr('stroke', '#999')
                .attr('stroke-width', 2);

            this.linkLabels = svg.selectAll('.link-label')
                .data(this.$store.links.linksData)
                .enter()
                .append('text')
                .attr('class', 'link-label select-none')
                .attr('font-size', '12px')
                .attr('fill', '#333');
            
            this.circleNodes = svg.selectAll('.node')
                .data(nodes)
                .enter()
                .append('g')
                .attr('class', 'node cursor-pointer')
                .attr('transform', d => `translate(${d.fx}, ${d.fy})`)
                .on('click', (event, d) => {
                    if (this.selectedNode === null) {
                        this.selectedNode = d;

                        d3.select(event.currentTarget)
                            .select('circle')
                            .attr('fill', 'orange');
                    } else if (this.selectedNode !== d) {
                        this.$store.links.addLink(this.selectedNode, d);

                        let actualColorNode = 'steelblue';
                        if (this.selectedNode.index === this.$store.nodes.startNode?.index) {
                            actualColorNode = 'red';
                        } else if (this.selectedNode.index === this.$store.nodes.endNode?.index) {
                            actualColorNode = 'blue';
                        }

                        d3.select(this.circleNodes.nodes()[this.selectedNode.index])
                            .select('circle')
                            .attr('fill', actualColorNode);

                        this.selectedNode = null;
                        d3.selectAll(event.currentTarget)
                            .attr('fill', 'steelblue');
                        
                        updateLinks();
                    }
                })
                .on('contextmenu', (event, d) => {
                    event.preventDefault();

                    const rect = event.currentTarget.getBoundingClientRect();
                    const top = rect.top + 80;
                    const left = rect.left - 30;

                    [...this.nodeTooltip.classList].forEach(cls => {
                        if (cls.startsWith('left-[') || cls.startsWith('top-[')) {
                            this.nodeTooltip.classList.remove(cls);
                        }
                    });

                    this.nodeTooltip.classList.add(`left-[${left}px]`, `top-[${top}px]`);

                    const tooltip = Alpine.$data(this.nodeTooltip);
                    tooltip.show(d);
                })
                .call(d3.drag()
                    .on('start', (event, d) => {
                        simulation.alpha(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on('drag', (event, d) => {
                        d.fx = event.x;
                        d.fy = event.y;
                        updatePositions();
                    })
                    .on('end', (event, d) => {
                        simulation.alpha(0);
                    })
                );
    
            this.circleNodes.append('circle')
                .attr('r', 30)
                .attr('fill', 'steelblue');
    
            this.circleNodes.append('text')
                .attr('class', 'node-name select-none font-bold')
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .text(d => d.name);
            
            this.circleNodes.append('text')
                .attr('class', 'node-h select-none text-xs')
                .attr('text-anchor', 'middle')
                .attr('dy', '1em')
                .attr('fill', 'white')
                .text('h(-)');
            
            const updatePositions = () => {
                simulation.tick();
    
                this.circleNodes.attr("transform", d => `translate(${d.fx ?? d.x}, ${d.fy ?? d.y})`);
    
                this.links
                    .attr("x1", d => d.source.fx)
                    .attr("y1", d => d.source.fy)
                    .attr("x2", d => d.target.fx)
                    .attr("y2", d => d.target.fy);
                
                
                this.$store.links.linksData.forEach(link => {
                    link.length = this.calculateEuclideanDistance(link.source, link.target);
                });
    
                this.linkLabels
                    .attr("x", d => (d.source.fx + d.target.fx) / 2)
                    .attr("y", d => (d.source.fy + d.target.fy) / 2)
                    .text(d => d.length);
                
                if (this.$store.nodes.endNode) {
                    this.$store.nodes.nodesData.forEach(node => {
                        node.h = this.calculateEuclideanDistance(node, this.$store.nodes.endNode);
                    });
                }
    
                d3.selectAll('.node')
                    .select('.node-h')
                    .text(d => this.$store.nodes.endNode != null ? `h(${d.h})` : 'h(-)');
            };
    
            const updateLinks = () => {
                let linkGroup = svg.selectAll('.link-group')
                    .data(this.$store.links.linksData);
    
                linkGroup.exit().remove();
    
                const linkGroupEnter = linkGroup.enter()
                    .append('g')
                    .attr('class', 'link-group');
    
                linkGroupEnter.append('line')
                    .attr('class', 'link')
                    .attr('stroke', '#999')
                    .attr('stroke-width', 2);
    
                linkGroupEnter.append('text')
                    .attr('class', 'link-label select-none')
                    .attr('font-size', '12px')
                    .attr('fill', '#333');
    
                linkGroup = linkGroupEnter.merge(linkGroup);
    
                this.links = linkGroup.select('line');
                this.linkLabels = linkGroup.select('text');
    
                simulation.force('link').links(this.$store.links.linksData);
    
                updatePositions();
            };
        },
        updateNode(node, prevNode, type) {
            if (prevNode) {
                d3.select(this.circleNodes.nodes()[prevNode.index])
                    .select('circle')
                    .attr('fill', 'steelblue');
            }

            d3.select(this.circleNodes.nodes()[node.index])
                .select('circle')
                .attr('fill', type == 'start' ? 'red' : 'blue');
            
            if (type == 'start') return;

            this.$store.nodes.nodesData.forEach(node => {
                node.h = this.calculateEuclideanDistance(node, this.$store.nodes.endNode);
            });

            d3.selectAll('.node')
                .select('.node-h')
                .text(d => `h(${d.h})`);
        },
        calculateEuclideanDistance(startNode, endNode) {
            const dx = endNode.fx - startNode.x;
            const dy = endNode.y - startNode.y;

            const result = Math.sqrt(dx ** 2 + dy ** 2);
            return Math.round(result * 100) / 100;
        },
        async runGreedyBestFirstSearch(isRerun) {
            if (isRerun) {
                this.$store.links.resetLinksStates();
                
                this.circleNodes.selectAll('circle')
                    .attr('fill', d => {
                        if (d == this.$store.nodes.startNode) {
                            return 'red';
                        } else if (d == this.$store.nodes.endNode) {
                            return 'blue';
                        } else {
                            return 'steelblue';
                        }
                    });
            }

            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // Find shortest path based on heuristic information            
            const queue = [];
            let smallestHeuristic = { target: { index: null, h: Infinity } }; // it actually a link
            let childrenLinks = this.$store.links.linksData.filter(item => item.source == this.$store.nodes.startNode || item.target == this.$store.nodes.startNode);

            queue.push(this.$store.nodes.startNode);
            this.$store.links.addPath(this.$store.nodes.startNode.name);

            let currentNode = this.$store.nodes.startNode;
            let prevNode = null;
            let nextNode = null;

            do {
                for (const link of childrenLinks) {
                    if (link.target === currentNode) {
                        [link.source, link.target] = [link.target, link.source];
                    }
                    
                    d3.select(this.circleNodes.nodes()[link.target.index])
                        .select('circle')
                        .attr('fill', 'gray');

                    if (link.target.h < smallestHeuristic.target.h) {
                        if (smallestHeuristic.target.index != null && smallestHeuristic != queue.at(-1)) {
                            d3.select(this.circleNodes.nodes()[smallestHeuristic.target.index])
                                .select('circle')
                                .attr('fill', 'gray');
                        }

                        smallestHeuristic = link;
    
                        d3.select(this.circleNodes.nodes()[smallestHeuristic.target.index])
                            .select('circle')
                            .attr('fill', 'green');

                        await delay(1000);
                    }
                }

                nextNode = smallestHeuristic.target;

                if (nextNode == prevNode) {
                    alert('No path found. Please check the start and goal positions.');
                    console.warn('BREAK ! No path found. Please check the start and goal positions.');
                    this.$store.links.addPath('...');
                    break;
                }

                prevNode = currentNode;
                currentNode = nextNode;

                queue.push(currentNode);
                this.$store.links.addPath(currentNode.name);
                this.$store.links.addCost(smallestHeuristic.length);

                smallestHeuristic = { target: { index: null, h: Infinity } };

                childrenLinks = this.$store.links.linksData.filter(item => queue.at(-1) == item.source || queue.at(-1) == item.target);
            } while (queue.at(-1).h != 0); 
        },
        resetMainComponent() {
            this.selectedNode = null;
            this.circleNodes = null;
            this.links = null;
            this.linkLabels = null;

            d3.select('#graph-svg')
                .selectAll('*')
                .remove();
        }
    }));

    Alpine.data('controllerComponent', () => ({
        isGraphCreated: false,
        isFinishRun: false,
        resetData() {
            this.isFinishRun = false; 
            this.isGraphCreated = false;

            this.$store.nodes.resetNodesStates();
            this.$store.links.resetLinksStates();
        }
    }));

    Alpine.data('tooltipComponent', () => ({ 
        isShow: false,
        timeoutID: null,
        selectedNode: null,
        show(selectedNode) {
            this.isShow = true;
            this.selectedNode = selectedNode;
            
            this.timeoutID = setTimeout(() => {
                this.isShow = false;
            }, 1000);
        },
        setNode(type) {
            this.$store.nodes[type == 'start' ? 'startNode' : 'endNode'] = this.selectedNode;
        }
    }));
});
