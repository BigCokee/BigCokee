async function draw(data) {
  data.forEach((d) => {
    d.duration = d3.timeMinute.count(
      d3.timeParse("%d/%m/%Y %H:%M:%S")(d.student_enter_time),
      d3.timeParse("%d/%m/%Y %H:%M:%S")(d.student_leave_time)
    );
    d.participation = Math.random();
    d.active_time = new Date(d.student_active_start_time);
  });

  let pra_chart1 = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    title: { text: "Nationality & Target", fontSize: 26 },
    data: { values: data },
    width: "container",
    height: "container",
    mark: "bar",
    encoding: {
      x: { aggregate: "count", type: "quantitative" },
      y: { field: "nationality" },
      color: {
        field: "learning_trarget",
        type: "nominal",
        scale: {
          domain: ["Academic", "Industrial", "Other"],
          range: ["#537DAB", "#EC7A79", "#F89D54"],
        },
      },
    },
  };


  // 关联容器和vega的代码

  vegaEmbed("#pra_chart1", pra_chart1);



  let pra_chart2 = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: { text: "Pre-Major & Target ", fontSize: 26 },
    data: { values: data },
    width: "container",
    height: "container",
    mark: "bar",
    encoding: {
      x: { aggregate: "count", type: "quantitative" },
      y: { field: "student_pre_major" },
      color: { field: "learning_trarget" ,  scale: {
        domain: ["Academic", "Industrial", "Other"],
        range: ["#537DAB", "#EC7A79", "#F89D54"],
      },},
    },
  };
  vegaEmbed("#pra_chart2", pra_chart2);

  new Sankey("sankey", data);
  const draw_table = () => {
    let tr = d3.select("tbody").selectAll("tr").data(data).join("tr");
    tr.append("td")
      .append("input")
      .attr("class", "uk-checkbox")
      .attr("type", "checkbox");
    tr.append("td").text((d) => d.student_name);
    tr.append("td").text((d) => d.student_pre_major);
    tr.append("td").text((d) => d.learning_trarget);
    tr.append("td").text((d) => d.nationality);
    tr.append("td").text((d) => d.student_group_code);
    tr.append("td").text((d) => d.student_email);
  };
  draw_table();
}

class Sankey {
  constructor(id, data) {
    this.data = data;
    this.id = id;
    this.init_svg();
    this.get_node_links();
    this.render_scale();
    this.generate_sankey();
  }
  // get_node_links
  get_node_links() {
    this.nodes = [
      ...this.get_indity_arr(this.data, "student_group_code"),
      ...this.get_indity_arr(this.data, "student_pre_major"),
      ...this.get_indity_arr(this.data, "learning_trarget"),
    ];

    this.links = [
      ...this.data.map((d) => {
        return {
          source: d["student_group_code"],
          target: d["student_pre_major"],
          value: 1,
        };
      }),
      ...this.data.map((d) => {
        return {
          source: d["student_pre_major"],
          target: d["learning_trarget"],
          value: 1,
        };
      }),
    ];
  }
  get_indity_arr(data, column) {
    return d3
      .groups(data, (d) => d[column])
      .map((d) => {
        return { id: d[0] };
      });
  }
  // generate_data
  generate_sankey() {
    let sankey = () => {
      const sankey = d3
        .sankey()
        .nodeId((d) => d.id)
        .nodeWidth(15)
        .nodePadding(10)
        .extent([
          [this.margin.left, this.margin.top],
          [this.innerW - 1, this.innerH - 5],
        ]);

      return ({ nodes, links }) =>
        sankey({
          nodes: nodes.map((d) => Object.assign({}, d)),
          links: links.map((d) => Object.assign({}, d)),
        });
    };

    const { nodes, links } = sankey()({ nodes: this.nodes, links: this.links });
    this.render({ nodes, links });
  }

  render_scale() {
    this.color = d3.scaleOrdinal().domain(this.nodes).range(d3.schemeTableau10);
  }
  // draw()

  render({ nodes, links }) {
    /*********************t添加桑吉图的横条**************************/
    /*****目前数据不足****/

    let svg = this.svg;
    const add_rect = () => {
      svg
        .append("g")
        .attr("stroke", "#000")
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("height", (d) => d.y1 - d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("fill", (d) => this.color(d.id))
        .append("title")
        .text((d) => `${d.id}`);
    };

    /*********************添加桑吉图的线条**************************/
    /*****label****/
    const add_path = () => {
      const link = svg
        .append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.5)
        .selectAll("g")
        .data(links)
        .join("g")
        .attr("fill", "none")
        .style("mix-blend-mode", "multiply");

      link
        .append("path")
        .attr("class", (d) => d.source.id)
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", (d) => this.color(d.source.id))
        .attr("stroke-width", (d) => Math.max(1, d.width));

      link.append("title").text((d) => `${d.source.id} → ${d.target.id}}`);
    };

    /*********************添加桑吉图的文本**************************/
    /*****label****/
    const add_text = () => {
      let text_g = svg
        .append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 7)
        .attr("fill", "#f58518");
      text_g
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", (d) => (d.x0 < this.innerW / 2 ? d.x1 + 6 : d.x0 - 6))
        .attr("y", (d) => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", (d) => (d.x0 < this.innerW / 2 ? "start" : "end"))
        .text((d) => d.id);
    };

    add_rect();
    add_path();
    add_text();
  }

  init_svg() {
    const div = d3.select(`#${this.id}`);
    div.selectAll("*").remove();
    const width = div.node().getBoundingClientRect().width;
    const height = div.node().getBoundingClientRect().height;
    this.margin = { left: 20, right: 40, top: 50, bottom: 20 };
    this.innerW = width - this.margin.left - this.margin.right;
    this.innerH = height - this.margin.top - this.margin.bottom;
    this.svg = div.append("svg").attr("width", width).attr("height", height);
    this.svg
      .append("text")
      .attr("x", this.innerW / 3)
      .attr("y", 25)
      .text("Student Groups")
      .attr("font-size", 26)
      .style("font-weight", "bold");

    this.svg.append("text").attr("x", 15).attr("y", 45).text("Groups");
    this.svg.append("text").attr("x", 225).attr("y", 45).text(" Pre-major ");
    this.svg.append("text").attr("x", 475).attr("y", 45).text("Target");
  }
}
document
  .getElementsByClassName("title-1")[0]
  .addEventListener("click", function (e) {
    window.location.href = "1.html";
  });

document
  .getElementsByClassName("title-2")[0]
  .addEventListener("click", function (e) {
    window.location.href = "2.html";
  });

document
  .getElementsByClassName("title-3")[0]
  .addEventListener("click", function (e) {
    window.location.href = "3.html";
  });
document
  .getElementsByClassName("title-5")[0]
  .addEventListener("click", function (e) {
    window.location.href = "index.html";
  });


async function init() {


  // D3获取数据方法
  
  let data = await d3.csv("./LAD_simulation_dataset.csv");



  data.forEach((d) => {
    d.major = d.student_pre_major;
    d.group = d.student_group_code;
    d.target = d.learning_trarget;
  });
  draw(data);
  const get_cates = (col) => [...new Set(data.map((d) => d[col]))];
  let filters = {};
  add_select({
    div: d3.select("#student_pre_major"),
    options: get_cates("student_pre_major"),
    classname: "major",
    changeEvent,
  });
  add_select({
    div: d3.select("#learning_trarget"),
    options: get_cates("nationality"),
    classname: "nationality",
    changeEvent,
  });
  add_select({
    div: d3.select("#student_group_code"),
    options: get_cates("student_group_code"),
    classname: "group",
    changeEvent,
  });

  function changeEvent(e, d) {
    let filter_value = { [this.className]: e.target.value };

    Object.assign(filters, filter_value);
    // 循环筛选器的多个条件,筛选数据
    let fiter_func = (d) => {
      let reduce_func = (pre, cur) => {
        return pre && (cur[1] === "All" ? true : d[cur[0]] === cur[1]);
      };
      return Object.entries(filters).reduce(reduce_func, true);
    };

    let chart_data = data.filter(fiter_func);
    debugger;
    draw(chart_data);
  }

  function add_select({ div, options, classname, changeEvent }) {
    options.unshift("All");
    // label
    div
      .selectAll(`.labelclassname`)
      .data([0])
      .join("label")
      .attr("class", "label" + classname)
      .html(classname);
    // add select
    let select = div
      .selectAll(`.classname`)
      .data([0])
      .join("select")
      .attr("class", classname);
    // opotions
    let option = select
      .selectAll("option")
      .data(options)
      .join("option")
      .attr("value", (d) => d)
      .html((d) => d);

    select.on("change", changeEvent);
  }
}
init();

d3.selectAll(".close").on("click", function (e) {
  window.location.href = "index.html";
});
