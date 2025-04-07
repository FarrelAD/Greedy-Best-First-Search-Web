document.addEventListener('alpine:init', () => {
    Alpine.data('mainComponent', () => ({
        selectedNode: null,
        simulation: null,
        svg: null,
        circleNodes: null,
        links: null,
        linkLabels: null,
        linksData: [],
        init() {
            // this.createGraph();

            // this.$watch(
            //     () => this.$store.nodes.nodes,
            //     () => this.updateGraph()
            // );
        },
        createGraph() {
            const nodes = this.$store.nodes.nodes;
    
            this.svg = d3.select("#graph-svg");
            const bbox = this.svg.node().getBoundingClientRect();

            this.simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(this.linksData).id(d => d.name).distance(1))
                .force("charge", d3.forceManyBody().strength(0))
                .force("center", d3.forceCenter(bbox.width / 2, bbox.height / 2))
                .stop();

            this.links = this.svg.selectAll(".link")
                .data(this.linksData)
                .enter()
                .append("line")
                .attr("class", "link")
                .attr("stroke", "#999")
                .attr("stroke-width", 2);

            this.linkLabels = this.svg.selectAll(".link-label")
                .data(this.linksData)
                .enter()
                .append("text")
                .attr("class", "link-label")
                .attr("font-size", "12px")
                .attr("fill", "#333");
    
            const handleNodeClick = (event, d) => {
                if (this.selectedNode === null) {
                    this.selectedNode = d;
                    d3.select(event.currentTarget).select("circle").attr("fill", "orange");
                } else if (this.selectedNode !== d) {
                    this.linksData.push({ source: this.selectedNode, target: d });
                    this.selectedNode = null;
                    d3.selectAll("circle").attr("fill", "steelblue");
                    this.updateLinks();
                } else {
                    this.selectedNode = null;
                    d3.selectAll("circle").attr("fill", "steelblue");
                }
            }
    
            const dragstarted = (event, d) => {
                this.simulation.alpha(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
    
            const dragged = (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
                this.updatePositions();
            }
    
            const dragended = (event, d) => {
                this.simulation.alpha(0);
            }
            
            const node = this.svg.selectAll(".node")
                .data(nodes)
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", d => `translate(${d.fx}, ${d.fy})`)
                .on("click", handleNodeClick)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));
    
            node.append("circle")
                .attr("r", 20)
                .attr("fill", "steelblue");
    
            node.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", ".35em")
                .attr("fill", "white")
                .text(d => d.name);
    
            this.updatePositions();
        },
        updateLinks() {
            let linkGroup = this.svg.selectAll(".link-group")
                .data(this.linksData);

            linkGroup.exit().remove();

            const linkGroupEnter = linkGroup.enter()
                .append("g")
                .attr("class", "link-group");

            linkGroupEnter.append("line")
                .attr("class", "link")
                .attr("stroke", "#999")
                .attr("stroke-width", 2);

            linkGroupEnter.append("text")
                .attr("class", "link-label")
                .attr("font-size", "12px")
                .attr("fill", "#333");

            linkGroup = linkGroupEnter.merge(linkGroup);

            this.links = linkGroup.select("line");
            this.linkLabels = linkGroup.select("text");

            this.simulation.force("link").links(this.linksData);

            this.updatePositions();
        },
        updatePositions() {
            this.simulation.tick();

            this.svg.selectAll(".node")
                .attr("transform", d => `translate(${d.fx ?? d.x}, ${d.fy ?? d.y})`);

            this.links
                .attr("x1", d => d.source.fx)
                .attr("y1", d => d.source.fy)
                .attr("x2", d => d.target.fx)
                .attr("y2", d => d.target.fy);

            this.linkLabels
                .attr("x", d => (d.source.fx + d.target.fx) / 2)
                .attr("y", d => (d.source.fy + d.target.fy) / 2)
                .text(d => {
                    const dx = d.target.fx - d.source.fx;
                    const dy = d.target.fy - d.source.fy;
                    return Math.sqrt(dx * dx + dy * dy).toFixed(1);
                });
        }
    }));

    Alpine.data('controllerComponent', () => ({
        isFinishRun: false
    }));

    Alpine.data('pathTableComponent', () => ({
        rows: [],
        addRow() {
            this.rows.push({ id: this.rows.length + 1 });
        }
    }));

    Alpine.data('pathRowTableComponent', () => ({
        selectedSource: null,
        selectedTarget: null,
        weight: 0,
        init() {
            this.selectedSource = this.$store.nodes.nodes[0]?.name;
            this.selectedTarget = this.$store.nodes.nodes.find(n => n.name !== this.selectedSource)?.name;
        },
        handleChange() {
            this.$store.paths.addPath(this.row.id, { 
                source: this.selectedSource, 
                target: this.selectedTarget, 
                weight: this.weight 
            });
        }
    }));
});
