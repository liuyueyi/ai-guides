import{_ as p,V as o,W as i,Y as n,Z as s,$ as t,X as e,F as c}from"./framework-2eefdab4.js";const l="/ai-guides/imgs/column/springai/D02-1.webp",u="/ai-guides/imgs/column/springai/D02-2.webp",r="/ai-guides/imgs/column/springai/D02-3.webp",d="/ai-guides/imgs/column/springai/D02-4.webp",k="/ai-guides/imgs/column/springai/D02-5.webp",v="/ai-guides/imgs/column/springai/D02-6.webp",m={},b=e('<p>大概两年之前，我们有一个快递类型的业务场景，为了简化用户的操作，为用户提供了一个快捷功能，支持用户直接粘贴一段自然语言的文本，然后由程序后台基于这段文本自动提取出结构化的地址信息，在方式大模型还未普及，我们使用的是baidu的一个收费接口</p><figure><img src="'+l+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>虽然价格不贵，但总归也是收费不是；这个场景非常垂直聚焦，正好也可以作为我们应用集成LLM的一个实验田。接下来我将介绍下如何利用 Spring AI 框架结合大模型能力，实现从自然语言文本中自动提取结构化地址信息的完整方案，并且通过function call实时查询行政编码，从而打造一个完整可直接商用的 <code>“地址提取智能体”</code></p><h2 id="一、整体架构设计" tabindex="-1"><a class="header-anchor" href="#一、整体架构设计" aria-hidden="true">#</a> 一、整体架构设计</h2><h3 id="_1-1-技术栈选型" tabindex="-1"><a class="header-anchor" href="#_1-1-技术栈选型" aria-hidden="true">#</a> 1.1 技术栈选型</h3>',5),g=e("<li><strong>SpringAI 1.1.2</strong>：统一AI调用框架</li><li><strong>ZhiPu</strong>：使用它的免费版大模型 <code>GLM-4-Flash</code></li><li><strong>Function Calling</strong>：让大模型具备调用外部API的能力</li><li><strong>SpringBoot 3.x</strong>：现代化Java框架</li><li><strong>JDK17+</strong>: java版本最低要求17</li>",5),h=n("strong",null,"行政区划编码库",-1),y={href:"https://github.com/modood/Administrative-divisions-of-China",target:"_blank",rel:"noopener noreferrer"},f=e('<h3 id="_1-2-系统架构" tabindex="-1"><a class="header-anchor" href="#_1-2-系统架构" aria-hidden="true">#</a> 1.2 系统架构</h3><p>从整体的视角来看，这个地址信息的提取结构相对清晰，基于用户输入的自然语言、通过LLM获取结构化的地址信息，然后返回给用户；</p><p>结合应用程序对地址的使用策略，我们在基本中文地址提取之外，通过Function Calling机制，实现让大模型返回的结构化信息中，包含行政区域代码，这样更方便将大模型返回的地址信息与项目中自己维护的地址信息进行映射；</p><blockquote><p>说明：返回行政区域编码，主要是为了避免出现 本地地址库中存 <code>湖北省、武汉市</code>，但是大模型返回的是 <code>湖北、武汉</code> 这类文本，导致后台程序无法精确根据地址文本进行映射的场景；通过统一的行政区域编码，则可以有效规避这种场景</p></blockquote><p>下面是整体的结构图</p><figure><img src="'+u+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><div class="language-Mermaid line-numbers-mode" data-ext="Mermaid"><pre class="language-Mermaid"><code>flowchart TB
    %% 样式定义：按功能分类，延续系列配色体系
    classDef inputNode fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,rounded:10px,font-size:13px
    classDef subgraphNode fill:#fafafa,stroke:#9c27b0,stroke-width:2px,rounded:10px
    classDef coreNode fill:#fce4ec,stroke:#c2185b,stroke-width:2px,rounded:10px,font-size:13px
    classDef logicNode fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,rounded:10px,font-size:13px
    classDef funcNode fill:#ffe0b2,stroke:#ef6c00,stroke-width:2px,rounded:10px,font-size:13px
    classDef outputNode fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,rounded:10px,font-size:13px
    classDef noteNode fill:#fafafa,stroke:#bdbdbd,stroke-dasharray:3 3,rounded:8px,font-size:12px

    %% 起始节点：用户输入
    input[&quot;用户输入自然语言地址&lt;br/&gt;Input: Natural Language Address&lt;br/&gt;（如：北京市朝阳区XX街XX小区）&quot;]:::inputNode

    %% 核心子模块：SpringAI 智能地址解析器
    subgraph SpringAI智能地址解析器SpringAI Address Parser
        style 地址提取智能体 fill:#fcf1f7,stroke:#c2185b,stroke-width:3px,rounded:10px
        prompt[&quot;Prompt 工程 + 结构化输出约束&lt;br/&gt;Prompt Engineering&lt;br/&gt;（强制返回：省/市/区/街/门牌）&quot;]:::coreNode
    end

    %% 中间处理节点
    structAddr[&quot;结构化地址信息&lt;br/&gt;Structured Address Info&lt;br/&gt;（标准化地址分段格式）&quot;]:::logicNode
    funcCall[&quot;Function Call&lt;br/&gt;行政区划编码查询&lt;br/&gt;（从地址库获取行政编码）&quot;]:::funcNode

    %% 最终输出节点
    output[&quot;标准化地址输出&lt;br/&gt;Standardized Address Output&lt;br/&gt;+ 行政区域编码&lt;br/&gt;（符合国标GB/T 2260格式）&quot;]:::outputNode

    %% 流程连接：强化链路逻辑
    input --&gt;|解析请求| prompt
    prompt --&gt;|地址分段结果| structAddr
    prompt --&gt;|编码查询触发| funcCall
    structAddr --&gt;|整合| output
    funcCall --&gt;|编码结果| output

    %% 核心注解：点明流程价值
    note[📌 核心逻辑：通过 Prompt 约束+Function Call 实现自然语言地址→标准化地址+行政编码的转化]:::noteNode
    prompt -.-&gt; note

    %% 箭头样式：强化链路区分
    linkStyle 0 stroke:#616161,stroke-width:1.5px
    linkStyle 1 stroke:#c2185b,stroke-width:1.5px
    linkStyle 2 stroke:#c2185b,stroke-width:1.5px
    linkStyle 3 stroke:#388e3c,stroke-width:1.5px
    linkStyle 4 stroke:#388e3c,stroke-width:1.5px
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="二、核心实现步骤" tabindex="-1"><a class="header-anchor" href="#二、核心实现步骤" aria-hidden="true">#</a> 二、核心实现步骤</h2>`,8),q={href:"https://hhui.top/tutorial/spring/springai/%E5%9F%BA%E7%A1%80%E7%AF%87/01.%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AASpringAI-Demo%E5%B7%A5%E7%A8%8B.html",target:"_blank",rel:"noopener noreferrer"},w=e(`<p>在下面的实现过程中，我们使用智谱的免费大模型作为我们的实际载体；若希望使用其他的模型的小伙伴，也可以直接替换（SpringAI对不同厂商的大模型集成得相当可以，切换成本较低）</p><h3 id="_2-1-环境配置与依赖" tabindex="-1"><a class="header-anchor" href="#_2-1-环境配置与依赖" aria-hidden="true">#</a> 2.1 环境配置与依赖</h3><p>我们使用的SpringAI的版本为最新的 <code>1.1.2</code> ，此外直接使用 zhipu 的starter来作为大模型的交互客户端</p><div class="language-xml line-numbers-mode" data-ext="xml"><pre class="language-xml"><code><span class="token comment">&lt;!-- pom.xml 关键依赖 --&gt;</span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependencies</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>org.springframework.boot<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>spring-boot-starter-web<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>org.springframework.ai<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>spring-ai-starter-model-zhipuai<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependencies</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后在配置文件中，设置对应的配置信息，其中关键点为</p><ul><li>api-key: 可以通过启动参数、系统环境变量等方式注入key，从而避免硬编码导致的泄露问题</li><li>model: 选择的是免费的 <code>GLM-4-Flash</code>， 支持 <code>function call</code> （说明：若你选中的模型不支持函数调用，那么就无法实现后续的行政区域查询的工具注入）</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token comment"># application.yml</span>
<span class="token key atrule">spring</span><span class="token punctuation">:</span>
  <span class="token key atrule">ai</span><span class="token punctuation">:</span>
    <span class="token key atrule">zhipuai</span><span class="token punctuation">:</span>
      <span class="token comment"># api-key 使用你自己申请的进行替换；如果为了安全考虑，可以通过启动参数进行设置</span>
      <span class="token key atrule">api-key</span><span class="token punctuation">:</span> $<span class="token punctuation">{</span>zhipuai<span class="token punctuation">-</span>api<span class="token punctuation">-</span>key<span class="token punctuation">}</span>
      <span class="token key atrule">chat</span><span class="token punctuation">:</span>
        <span class="token key atrule">options</span><span class="token punctuation">:</span>
          <span class="token key atrule">model</span><span class="token punctuation">:</span> GLM<span class="token punctuation">-</span>4<span class="token punctuation">-</span>Flash


<span class="token comment"># 修改日志级别</span>
<span class="token key atrule">logging</span><span class="token punctuation">:</span>
  <span class="token key atrule">level</span><span class="token punctuation">:</span>
    <span class="token key atrule">org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor</span><span class="token punctuation">:</span> debug
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-2-地址数据结构设计" tabindex="-1"><a class="header-anchor" href="#_2-2-地址数据结构设计" aria-hidden="true">#</a> 2.2 地址数据结构设计</h3><p>首先定义一下我们希望接受的结构化返回数据，以常见的快递物流的地址信息为例，关键信息包含：</p><ul><li>省</li><li>市</li><li>区</li><li>街道</li><li>详细地址</li><li>用户</li><li>手机号</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">record</span> <span class="token class-name">Address</span><span class="token punctuation">(</span>
        <span class="token annotation punctuation">@JsonPropertyDescription</span><span class="token punctuation">(</span><span class="token string">&quot;省，如 湖北省&quot;</span><span class="token punctuation">)</span>
        <span class="token class-name">String</span> province<span class="token punctuation">,</span>
        <span class="token annotation punctuation">@JsonPropertyDescription</span><span class="token punctuation">(</span><span class="token string">&quot;市，如 武汉市&quot;</span><span class="token punctuation">)</span>
        <span class="token class-name">String</span> city<span class="token punctuation">,</span>
        <span class="token annotation punctuation">@JsonPropertyDescription</span><span class="token punctuation">(</span><span class="token string">&quot;区，如 武昌区&quot;</span><span class="token punctuation">)</span>
        <span class="token class-name">String</span> area<span class="token punctuation">,</span>
        <span class="token annotation punctuation">@JsonPropertyDescription</span><span class="token punctuation">(</span><span class="token string">&quot;街道，如 东湖路&quot;</span><span class="token punctuation">)</span>
        <span class="token class-name">String</span> street<span class="token punctuation">,</span>
        <span class="token annotation punctuation">@JsonPropertyDescription</span><span class="token punctuation">(</span><span class="token string">&quot;行政区域编码，如 420106&quot;</span><span class="token punctuation">)</span>
        <span class="token class-name">String</span> adCode<span class="token punctuation">,</span>
        <span class="token annotation punctuation">@JsonPropertyDescription</span><span class="token punctuation">(</span><span class="token string">&quot;详细地址，如 发财无限公司8栋8单元888号&quot;</span><span class="token punctuation">)</span>
        <span class="token class-name">String</span> detailInfo<span class="token punctuation">,</span>
        <span class="token annotation punctuation">@JsonPropertyDescription</span><span class="token punctuation">(</span><span class="token string">&quot;联系人，如 张三&quot;</span><span class="token punctuation">)</span>
        <span class="token class-name">String</span> personName<span class="token punctuation">,</span>
        <span class="token annotation punctuation">@JsonPropertyDescription</span><span class="token punctuation">(</span><span class="token string">&quot;联系人电话，如 15345785872&quot;</span><span class="token punctuation">)</span>
        <span class="token class-name">String</span> personPhone
<span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-3-快速原型实现" tabindex="-1"><a class="header-anchor" href="#_2-3-快速原型实现" aria-hidden="true">#</a> 2.3 快速原型实现</h3><p>接下来我们看一下直接使用大模型本身的文本提取能力，快速实现一个基础的原型</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@RestController</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">ChatController</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">ChatModel</span> chatModel<span class="token punctuation">;</span>

       <span class="token annotation punctuation">@Autowired</span>
    <span class="token keyword">public</span> <span class="token class-name">ChatController</span><span class="token punctuation">(</span><span class="token class-name">ChatModel</span> chatModel<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>chatModel <span class="token operator">=</span> chatModel<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 从传入的自然语言中，提取出地址信息
     *
     * <span class="token keyword">@param</span> <span class="token parameter">content</span>
     * <span class="token keyword">@return</span>
     */</span>
    <span class="token annotation punctuation">@GetMapping</span><span class="token punctuation">(</span><span class="token string">&quot;/ai/genAddress&quot;</span><span class="token punctuation">)</span>
    <span class="token keyword">public</span> <span class="token class-name">Address</span> <span class="token function">generateAddress</span><span class="token punctuation">(</span><span class="token class-name">String</span> content<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">BeanOutputConverter</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Address</span><span class="token punctuation">&gt;</span></span> beanOutputConverter <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">BeanOutputConverter</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token class-name">Address</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">String</span> format <span class="token operator">=</span> beanOutputConverter<span class="token punctuation">.</span><span class="token function">getFormat</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>


        <span class="token class-name">PromptTemplate</span> template <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">PromptTemplate</span><span class="token punctuation">(</span><span class="token string">&quot;请从下面个你的文本中，帮我提取详细的地址信息，要求中文返回: \\n\\n地址信息：\\n{area} \\n\\n返回格式:{format}&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">Prompt</span> prompt <span class="token operator">=</span> template<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token class-name">Map</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token string">&quot;area&quot;</span><span class="token punctuation">,</span> content<span class="token punctuation">,</span> <span class="token string">&quot;format&quot;</span><span class="token punctuation">,</span> format<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">Generation</span> generation <span class="token operator">=</span> chatModel<span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>prompt<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getResult</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>generation <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> beanOutputConverter<span class="token punctuation">.</span><span class="token function">convert</span><span class="token punctuation">(</span>generation<span class="token punctuation">.</span><span class="token function">getOutput</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getText</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在上面的实现中，我们直接使用 <code>ChatModel</code> 进行大模型的交互，在这不到10行的代码中，主要使用到两个技术点</p><ul><li>提示词模板： PromptTemplate 实现占位替换</li><li>结果化返回： 通过<code>BeanOutputConverter</code>实现bean对象转json schema，然后通过提示词工程约束大模型返回；同时也通过Converter实现返回结果转Bean对象</li></ul><p>接下来看一下试验效果</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># 用于测试的文本，示例来源于 https://ai.baidu.com/tech/nlp_apply/address

礼盒20个吉林省长春市朝阳区开运街领秀朝阳小区 田甜 18692093383

玲 18682085605 广州市天河区迎福路527号广东金融学院
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+r+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>从上面的实际表现也可以看出，有两个明显的问题</p><ul><li>行政区域编码返回的不一定准确：如上面的 <code>长春市朝阳区</code> 的行政区域编码返回就不对</li><li>详细地址提取不一定准确：上图中广州市的这个地址，两次请求的返回不一样，且结果不完整</li></ul><p>从这个快速原型我们也可以看出，基于大模型做地址识别方向可行，但是还需要“调教” ———— 即需要有一个更稳定、高质量输出的提示词设计</p><h3 id="_2-4-prompt工程-引导模型输出的准确的结果" tabindex="-1"><a class="header-anchor" href="#_2-4-prompt工程-引导模型输出的准确的结果" aria-hidden="true">#</a> 2.4 Prompt工程：引导模型输出的准确的结果</h3>',23),_={href:"https://mp.weixin.qq.com/s/ZQbztqBq7_PzynG06N4-mg",target:"_blank",rel:"noopener noreferrer"},M=e(`<p>由于这个场景的目标非常清晰，所以对应的设计可以从下面几个出发</p><ul><li>角色：地址信息提取专家</li><li>约束：一些地址相关的提取规则</li><li>结构化：返回的定义</li><li>少样本学习：提供示例，用于少样本学习</li></ul><p>然后在上面的基础上，我们改造一下具体的实现策略</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@RestController</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">ChatController</span> <span class="token punctuation">{</span>
    
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">String</span> <span class="token constant">SYSTEM_PROMPT</span> <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
        你是一个专业的地址信息提取专家。请从用户输入的自然语言文本中提取结构化地址信息。
                
        提取规则：
        1. 识别并分离出：省份、城市、区县、街道、详细地址
        2. 地址组件可能存在简称、别称，请转换为标准名称
        3. 如果用户输入包含&quot;省&quot;、&quot;市&quot;、&quot;区&quot;、&quot;县&quot;等关键词，需正确处理
                
        输出格式要求：
        - 省份：完整省份名称，如&quot;广东省&quot;
        - 城市：地级市名称，直辖市填&quot;北京市&quot;等
        - 区县：区或县级市名称
        - 街道：街道、乡镇名称
        - 详细地址：门牌号、小区、楼栋等
        - 行政区域编码：通常是区县一级的编码，6位数字
                
        示例输入：&quot;礼盒20个吉林省长春市朝阳区开运街领秀朝阳小区 田甜 18692093383&quot;
        示例输出： {
            &quot;province&quot;: &quot;吉林省&quot;,
            &quot;city&quot;: &quot;长春市&quot;,
            &quot;area&quot;: &quot;朝阳区&quot;,
            &quot;street&quot;: &quot;开运街领秀朝阳小区&quot;,
            &quot;adCode&quot;: &quot;220104&quot;,
            &quot;personName&quot;: &quot;田甜&quot;,
            &quot;personPhone&quot;: &quot;18692093383&quot;
        }
        &quot;&quot;&quot;</span><span class="token punctuation">;</span>
    
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">ChatModel</span> chatModel<span class="token punctuation">;</span>

    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">ChatClient</span> chatClient<span class="token punctuation">;</span>

    <span class="token annotation punctuation">@Autowired</span>
    <span class="token keyword">public</span> <span class="token class-name">ChatController</span><span class="token punctuation">(</span><span class="token class-name">ChatModel</span> chatModel<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>chatModel <span class="token operator">=</span> chatModel<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>chatClient <span class="token operator">=</span> <span class="token class-name">ChatClient</span><span class="token punctuation">.</span><span class="token function">builder</span><span class="token punctuation">(</span>chatModel<span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">defaultAdvisors</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">SimpleLoggerAdvisor</span><span class="token punctuation">(</span><span class="token class-name">ModelOptionsUtils</span><span class="token operator">::</span><span class="token function">toJsonStringPrettyPrinter</span><span class="token punctuation">,</span> <span class="token class-name">ModelOptionsUtils</span><span class="token operator">::</span><span class="token function">toJsonStringPrettyPrinter</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">defaultSystem</span><span class="token punctuation">(</span><span class="token constant">SYSTEM_PROMPT</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@GetMapping</span><span class="token punctuation">(</span><span class="token string">&quot;/ai/genAddressWithPromptTemplate&quot;</span><span class="token punctuation">)</span>
    <span class="token keyword">public</span> <span class="token class-name">Address</span> <span class="token function">generateAddressWithPromptTemplate</span><span class="token punctuation">(</span><span class="token class-name">String</span> content<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">ChatClient<span class="token punctuation">.</span>CallResponseSpec</span> res <span class="token operator">=</span> chatClient<span class="token punctuation">.</span><span class="token function">prompt</span><span class="token punctuation">(</span>content<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">Address</span> address <span class="token operator">=</span> res<span class="token punctuation">.</span><span class="token function">entity</span><span class="token punctuation">(</span><span class="token class-name">Address</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> address<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在这个实现中，我们直接提取了一个提示词模板 <code>SYSTEM_PROMPT</code> （虽然上面的代码是直接硬编码的方式写成的，但是更推荐的是使用更专业的提示词管理服务来维护、比如支持版本、灰度对比等）</p><p>其次就是具体的LLM交互中，我们使用 <code>ChatClient</code> 替换了更原生的 <code>ChatModel</code>，因为它对系统提示词、结构化返回从使用角度封装得更友好，使用起来更简单；从代码量也可以看出，三行就完前面同等的调用过程</p><p>同样的我们来看看具体表现，依然使用前面的测试文本</p><figure><img src="`+d+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>从上面的结果来看，广州市这个文本的详细地址解析就稳定可靠多了；但是吉林这个地址行政区域编码错误的问题依旧，显然提示词本身是无法纠正大模型的错误资料库的</p><p>所以接下来我们就需要给大模型安上“作弊器”，让它有能力查询到正确的行政区域编码</p><h3 id="_2-5-function-call实现-行政区划编码查询" tabindex="-1"><a class="header-anchor" href="#_2-5-function-call实现-行政区划编码查询" aria-hidden="true">#</a> 2.5 Function Call实现：行政区划编码查询</h3><p>虽然有一些API提供了行政区域编码（比如高德），但是为了减少外部依赖（当然也是为了白嫖），我们选择使用标准的行政编码库来提供自己的查询服务</p>',12),C={href:"https://github.com/modood/Administrative-divisions-of-China",target:"_blank",rel:"noopener noreferrer"},x=e(`<blockquote><p>为了准确性，我们选择的是 <code>pca-code.json</code> 这个包含 省、市、区 三级联动的数据库（因为街道的变动频率相比较于这三级高太多了...）</p></blockquote><p>这个字典的数据模型形如</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">[</span>
    <span class="token punctuation">{</span>
        <span class="token property">&quot;code&quot;</span><span class="token operator">:</span> <span class="token string">&quot;11&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;北京市&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;children&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
            <span class="token punctuation">{</span>
                <span class="token property">&quot;code&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1101&quot;</span><span class="token punctuation">,</span>
                <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;市辖区&quot;</span><span class="token punctuation">,</span>
                <span class="token property">&quot;children&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
                    <span class="token punctuation">{</span>
                        <span class="token property">&quot;code&quot;</span><span class="token operator">:</span> <span class="token string">&quot;110101&quot;</span><span class="token punctuation">,</span>
                        <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;东城区&quot;</span>
                    <span class="token punctuation">}</span><span class="token punctuation">,</span>
                    <span class="token punctuation">{</span>
                        <span class="token property">&quot;code&quot;</span><span class="token operator">:</span> <span class="token string">&quot;110102&quot;</span><span class="token punctuation">,</span>
                        <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;西城区&quot;</span>
                    <span class="token punctuation">}</span>
                <span class="token punctuation">]</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">]</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>因此我们可以实现一个简单基于内存的行政区域查询服务</p><ul><li>读取字典、映射为结构化数据</li><li>解析为Map格式，方便快速查找</li></ul><p>下面就是一个基础的初始化实现过程（阅读起来有困难的小伙伴不妨结合AICoding解释一下）</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Service</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">AddressAdCodeService</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">Logger</span> log <span class="token operator">=</span> <span class="token class-name"><span class="token namespace">org<span class="token punctuation">.</span>slf4j<span class="token punctuation">.</span></span>LoggerFactory</span><span class="token punctuation">.</span><span class="token function">getLogger</span><span class="token punctuation">(</span><span class="token class-name">AddressAdCodeService</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">static</span> <span class="token class-name">String</span> data <span class="token operator">=</span> <span class="token string">&quot;data/pca-code.json&quot;</span><span class="token punctuation">;</span>

    <span class="token keyword">private</span> <span class="token keyword">volatile</span> <span class="token class-name">Map</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">ProvinceMapper</span><span class="token punctuation">&gt;</span></span> provinceMap<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * 从 data/pca-code.json 中加载数据，并结构化
     */</span>
    <span class="token annotation punctuation">@PostConstruct</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">init</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">try</span> <span class="token punctuation">(</span><span class="token class-name">InputStream</span> stream <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">getClass</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getClassLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getResourceAsStream</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 读取数据</span>
            <span class="token class-name">String</span> content <span class="token operator">=</span> <span class="token class-name">IOUtils</span><span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span>stream<span class="token punctuation">,</span> <span class="token constant">UTF_8</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token class-name">ObjectMapper</span> mapper <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ObjectMapper</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token comment">// 将content反序列化为 List&lt;Province&gt;</span>
            <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Province</span><span class="token punctuation">&gt;</span></span> provinces <span class="token operator">=</span> mapper<span class="token punctuation">.</span><span class="token function">readValue</span><span class="token punctuation">(</span>content<span class="token punctuation">,</span> mapper<span class="token punctuation">.</span><span class="token function">getTypeFactory</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">constructCollectionType</span><span class="token punctuation">(</span><span class="token class-name">List</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token class-name">Province</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token comment">// 构建结构化数据，方便快速查找</span>
            <span class="token class-name">HashMap</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">ProvinceMapper</span><span class="token punctuation">&gt;</span></span> map <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">HashMap</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">Province</span> province <span class="token operator">:</span> provinces<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token class-name">ProvinceMapper</span> provinceMap <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ProvinceMapper</span><span class="token punctuation">(</span>province<span class="token punctuation">.</span>code<span class="token punctuation">,</span> province<span class="token punctuation">.</span>name<span class="token punctuation">,</span> <span class="token keyword">new</span> <span class="token class-name">HashMap</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                map<span class="token punctuation">.</span><span class="token function">put</span><span class="token punctuation">(</span>province<span class="token punctuation">.</span>name<span class="token punctuation">,</span> provinceMap<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">City</span> city <span class="token operator">:</span> province<span class="token punctuation">.</span>children<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token class-name">Map</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">Area</span><span class="token punctuation">&gt;</span></span> areaMap <span class="token operator">=</span> <span class="token class-name">CollectionUtils</span><span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span>city<span class="token punctuation">.</span>children<span class="token punctuation">)</span> <span class="token operator">?</span> <span class="token class-name">Map</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">:</span> city<span class="token punctuation">.</span>children<span class="token punctuation">.</span><span class="token function">stream</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">collect</span><span class="token punctuation">(</span><span class="token class-name">Collectors</span><span class="token punctuation">.</span><span class="token function">toMap</span><span class="token punctuation">(</span>s <span class="token operator">-&gt;</span> s<span class="token punctuation">.</span>name<span class="token punctuation">,</span> s <span class="token operator">-&gt;</span> s<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token class-name">CityMapper</span> cityMap <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">CityMapper</span><span class="token punctuation">(</span>city<span class="token punctuation">.</span>code<span class="token punctuation">,</span> city<span class="token punctuation">.</span>name<span class="token punctuation">,</span> areaMap<span class="token punctuation">)</span><span class="token punctuation">;</span>
                    provinceMap<span class="token punctuation">.</span>children<span class="token punctuation">.</span><span class="token function">put</span><span class="token punctuation">(</span>city<span class="token punctuation">.</span>name<span class="token punctuation">,</span> cityMap<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">this</span><span class="token punctuation">.</span>provinceMap <span class="token operator">=</span> map<span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">IOException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">RuntimeException</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token keyword">record</span> <span class="token class-name">Area</span><span class="token punctuation">(</span><span class="token class-name">String</span> code<span class="token punctuation">,</span> <span class="token class-name">String</span> name<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">}</span>


    <span class="token keyword">public</span> <span class="token keyword">record</span> <span class="token class-name">City</span><span class="token punctuation">(</span><span class="token class-name">String</span> code<span class="token punctuation">,</span> <span class="token class-name">String</span> name<span class="token punctuation">,</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Area</span><span class="token punctuation">&gt;</span></span> children<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token keyword">record</span> <span class="token class-name">CityMapper</span><span class="token punctuation">(</span><span class="token class-name">String</span> code<span class="token punctuation">,</span> <span class="token class-name">String</span> name<span class="token punctuation">,</span> <span class="token class-name">Map</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">Area</span><span class="token punctuation">&gt;</span></span> children<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token keyword">record</span> <span class="token class-name">Province</span><span class="token punctuation">(</span><span class="token class-name">String</span> code<span class="token punctuation">,</span> <span class="token class-name">String</span> name<span class="token punctuation">,</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">City</span><span class="token punctuation">&gt;</span></span> children<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token keyword">record</span> <span class="token class-name">ProvinceMapper</span><span class="token punctuation">(</span><span class="token class-name">String</span> code<span class="token punctuation">,</span> <span class="token class-name">String</span> name<span class="token punctuation">,</span> <span class="token class-name">Map</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">CityMapper</span><span class="token punctuation">&gt;</span></span> children<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>让后就是提供查询服务，并通过SpringAI 的 <code>@Tool</code> 注解来声明为大模型的回调工具</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 同样在 AddressAdCodeService.java 类中</span>

<span class="token doc-comment comment">/**
 * 查询地址对应的行政编码
 *
 * <span class="token keyword">@param</span> <span class="token parameter">province</span> 省
 * <span class="token keyword">@param</span> <span class="token parameter">city</span>     市
 * <span class="token keyword">@param</span> <span class="token parameter">area</span>     区
 * <span class="token keyword">@return</span> 行政编码
 */</span>
<span class="token annotation punctuation">@Tool</span><span class="token punctuation">(</span>description <span class="token operator">=</span> <span class="token string">&quot;传入地址信息，返回对应的行政区域编码， 如输入 湖北省武汉市武昌区，返回的行政编码为 420106&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">queryAdCode</span><span class="token punctuation">(</span>
        <span class="token annotation punctuation">@ToolParam</span><span class="token punctuation">(</span>description <span class="token operator">=</span> <span class="token string">&quot;省，如 湖北省&quot;</span><span class="token punctuation">)</span>
        <span class="token class-name">String</span> province<span class="token punctuation">,</span>
        <span class="token annotation punctuation">@ToolParam</span><span class="token punctuation">(</span>description <span class="token operator">=</span> <span class="token string">&quot;市，如 武汉市&quot;</span><span class="token punctuation">)</span>
        <span class="token class-name">String</span> city<span class="token punctuation">,</span>
        <span class="token annotation punctuation">@ToolParam</span><span class="token punctuation">(</span>description <span class="token operator">=</span> <span class="token string">&quot;区，如 武昌区&quot;</span><span class="token punctuation">)</span>
        <span class="token class-name">String</span> area<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    log<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span><span class="token string">&quot;queryAdCode: {}, {}, {}&quot;</span><span class="token punctuation">,</span> province<span class="token punctuation">,</span> city<span class="token punctuation">,</span> area<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">ProvinceMapper</span> provinceMap <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>provinceMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>province<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token class-name">StringUtils</span><span class="token punctuation">.</span><span class="token function">isBlank</span><span class="token punctuation">(</span>city<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> provinceMap<span class="token punctuation">.</span>code<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token class-name">CityMapper</span> cityMap <span class="token operator">=</span> provinceMap<span class="token punctuation">.</span>children<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>city<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>cityMap <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 市未查到，返回省的行政编码</span>
        <span class="token keyword">return</span> provinceMap<span class="token punctuation">.</span>code<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token class-name">StringUtils</span><span class="token punctuation">.</span><span class="token function">isBlank</span><span class="token punctuation">(</span>area<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> cityMap<span class="token punctuation">.</span>code<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token class-name">Area</span> ar <span class="token operator">=</span> cityMap<span class="token punctuation">.</span>children<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>area<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ar <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 区未查到，返回市的编码</span>
        <span class="token keyword">return</span> cityMap<span class="token punctuation">.</span>code<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> ar<span class="token punctuation">.</span>code<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-6-完全体智能地址提取" tabindex="-1"><a class="header-anchor" href="#_2-6-完全体智能地址提取" aria-hidden="true">#</a> 2.6 完全体智能地址提取</h3><p>上面虽然实现了行政区域查询服务，但是还需要把它提供给大模型使用，这一步我们需要怎么做呢？</p><p>看下面的实现，你会发现这个改动非常简单，只需两步：</p><ul><li>调整提示词约束：要求大模型必须通过提供的工具来获取行政区域编码</li><li>注册工具</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token annotation punctuation">@RestController</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">ChatController</span> <span class="token punctuation">{</span>

  <span class="token comment">// 注意下面提取规则中的第四点，就是我们新增的约束</span>
  <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">String</span> <span class="token constant">SYSTEM_PROMPT</span> <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
            你是一个专业的地址信息提取专家。请从用户输入的自然语言文本中提取结构化地址信息。
                    
            提取规则：
            1. 识别并分离出：省份、城市、区县、街道、详细地址
            2. 地址组件可能存在简称、别称，请转换为标准名称
            3. 如果用户输入包含&quot;省&quot;、&quot;市&quot;、&quot;区&quot;、&quot;县&quot;等关键词，需正确处理
            4. 行政区域编码必须使用提供的工具 queryAdCode 进行获取
                    
            输出格式要求：
            - 省份：完整省份名称，如&quot;广东省&quot;
            - 城市：地级市名称，直辖市填&quot;北京市&quot;等
            - 区县：区或县级市名称
            - 街道：街道、乡镇名称
            - 详细地址：门牌号、小区、楼栋等
            - 行政区域编码：通常是区县一级的编码，6位数字
                    
            示例输入：&quot;礼盒20个吉林省长春市朝阳区开运街领秀朝阳小区11栋2号楼304 田甜 18692093383&quot;
            示例输出： {
                &quot;province&quot;: &quot;吉林省&quot;,
                &quot;city&quot;: &quot;长春市&quot;,
                &quot;area&quot;: &quot;朝阳区&quot;,
                &quot;street&quot;: &quot;开运街领秀朝阳小区&quot;,
                &quot;detailInfo&quot;: &quot;11栋2号楼304&quot;,
                &quot;adCode&quot;: &quot;220104&quot;,
                &quot;personName&quot;: &quot;田甜&quot;,
                &quot;personPhone&quot;: &quot;18692093383&quot;
            }
            &quot;&quot;&quot;</span><span class="token punctuation">;</span>

    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">ChatModel</span> chatModel<span class="token punctuation">;</span>

    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">ChatClient</span> chatClient<span class="token punctuation">;</span>

    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">AddressAdCodeService</span> addressAdCodeService<span class="token punctuation">;</span>

    <span class="token annotation punctuation">@Autowired</span>
    <span class="token keyword">public</span> <span class="token class-name">ChatController</span><span class="token punctuation">(</span><span class="token class-name">ChatModel</span> chatModel<span class="token punctuation">,</span> <span class="token class-name">AddressAdCodeService</span> addressAdCodeService<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>chatModel <span class="token operator">=</span> chatModel<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>addressAdCodeService <span class="token operator">=</span> addressAdCodeService<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>chatClient <span class="token operator">=</span> <span class="token class-name">ChatClient</span><span class="token punctuation">.</span><span class="token function">builder</span><span class="token punctuation">(</span>chatModel<span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">defaultAdvisors</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">SimpleLoggerAdvisor</span><span class="token punctuation">(</span><span class="token class-name">ModelOptionsUtils</span><span class="token operator">::</span><span class="token function">toJsonStringPrettyPrinter</span><span class="token punctuation">,</span> <span class="token class-name">ModelOptionsUtils</span><span class="token operator">::</span><span class="token function">toJsonStringPrettyPrinter</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">defaultSystem</span><span class="token punctuation">(</span><span class="token constant">SYSTEM_PROMPT</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@GetMapping</span><span class="token punctuation">(</span><span class="token string">&quot;/ai/genAddressWithCodeTool&quot;</span><span class="token punctuation">)</span>
    <span class="token keyword">public</span> <span class="token class-name">Address</span> <span class="token function">generateAddressWithCodeTool</span><span class="token punctuation">(</span><span class="token class-name">String</span> content<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 直接使用 tools() 来注册大模型回调的工具 </span>
        <span class="token class-name">ChatClient<span class="token punctuation">.</span>CallResponseSpec</span> res <span class="token operator">=</span> chatClient<span class="token punctuation">.</span><span class="token function">prompt</span><span class="token punctuation">(</span>content<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">tools</span><span class="token punctuation">(</span>addressAdCodeService<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">Address</span> address <span class="token operator">=</span> res<span class="token punctuation">.</span><span class="token function">entity</span><span class="token punctuation">(</span><span class="token class-name">Address</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> address<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>再次试验一下实际表现</p><figure><img src="`+k+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="_2-7-整体流程" tabindex="-1"><a class="header-anchor" href="#_2-7-整体流程" aria-hidden="true">#</a> 2.7 整体流程</h3><p>接下来我们从整体的视角回归一下这个智能地址提取的全流程，其中相关的技术点为</p><ul><li>提示词工程</li><li>结构化返回</li><li>Function Call工具调用</li></ul><figure><img src="'+v+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><div class="language-Mermaid line-numbers-mode" data-ext="Mermaid"><pre class="language-Mermaid"><code>flowchart TD
    A[用户输入自然语言地址] --&gt; B{地址解析智能体}
    
    B --&gt; C[Prompt工程优化]
    C --&gt; D[调用大语言模型]
    D --&gt; F[提取结构化地址]
    
    F --&gt; H[生成标准化地址]
    F --&gt; I[通过Function Call&lt;br&gt;查询行政编码]
    
    I --&gt; J{编码查询结果?}
    J --&gt;|成功| K[获取行政区域编码]
    J --&gt;|失败| L[使用默认编码]
    
    K --&gt; M[组装完整结果]
    L --&gt; M
    
    M --&gt; N[输出标准化地址&lt;br&gt;+行政编码]
    
    style A fill:#e1f5fe,stroke:#01579b
    style B fill:#bbdefb,stroke:#0d47a1,stroke-width:2px
    style D fill:#f3e5f5,stroke:#4a148c
    style F fill:#c8e6c9,stroke:#2e7d32
    style I fill:#fff3e0,stroke:#e65100
    style K fill:#d1c4e9,stroke:#4527a0
    style M fill:#fce4ec,stroke:#ad1457
    style N fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="三、生产优化及部署" tabindex="-1"><a class="header-anchor" href="#三、生产优化及部署" aria-hidden="true">#</a> 三、生产优化及部署</h2><h3 id="_3-1-调参-稳定性输出" tabindex="-1"><a class="header-anchor" href="#_3-1-调参-稳定性输出" aria-hidden="true">#</a> 3.1 调参：稳定性输出</h3><p>在实际的生产体验过程中，我们大概率会发现，同样一段自然语言，大模型提取的详细地址这块，可能并不总是相同的，why?</p>`,24),A=n("code",null,"temperature",-1),S={href:"https://mp.weixin.qq.com/s/t_BuAW9i0npcaJdua3Am2Q",target:"_blank",rel:"noopener noreferrer"},P=e(`<p>在我们这个场景下，很明显不希望大模型自由发挥，所以我们可以将<code>temperature</code>设置较低，确保输出结果稳定</p><p>我们需要修改的就是配置文件中的<code>spring.ai.zhipuai.chat.options.temperature</code>，如下</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">spring</span><span class="token punctuation">:</span>
  <span class="token key atrule">ai</span><span class="token punctuation">:</span>
    <span class="token key atrule">zhipuai</span><span class="token punctuation">:</span>
      <span class="token comment"># api-key 使用你自己申请的进行替换；如果为了安全考虑，可以通过启动参数进行设置</span>
      <span class="token key atrule">api-key</span><span class="token punctuation">:</span> $<span class="token punctuation">{</span>zhipuai<span class="token punctuation">-</span>api<span class="token punctuation">-</span>key<span class="token punctuation">}</span>
      <span class="token key atrule">chat</span><span class="token punctuation">:</span>
        <span class="token key atrule">options</span><span class="token punctuation">:</span>
          <span class="token key atrule">model</span><span class="token punctuation">:</span> GLM<span class="token punctuation">-</span>4<span class="token punctuation">-</span>Flash
          <span class="token key atrule">temperature</span><span class="token punctuation">:</span> <span class="token number">0.2</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-2-docker容器化部署" tabindex="-1"><a class="header-anchor" href="#_3-2-docker容器化部署" aria-hidden="true">#</a> 3.2 Docker容器化部署</h3><div class="language-docker line-numbers-mode" data-ext="docker"><pre class="language-docker"><code><span class="token comment"># Dockerfile</span>
<span class="token instruction"><span class="token keyword">FROM</span> openjdk:17-jdk-slim</span>
<span class="token instruction"><span class="token keyword">WORKDIR</span> /app</span>
<span class="token instruction"><span class="token keyword">COPY</span> target/D03-text-address-extraction-0.0.1-SNAPSHOT.jar app.jar</span>
<span class="token instruction"><span class="token keyword">EXPOSE</span> 8080</span>
<span class="token instruction"><span class="token keyword">ENTRYPOINT</span> [<span class="token string">&quot;java&quot;</span>, <span class="token string">&quot;-jar&quot;</span>, <span class="token string">&quot;app.jar&quot;</span>, </span>
            &quot;--spring.ai.zhipuai.api-key=\${ZHIPU_KEY}&quot;]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-3-kubernetes部署配置" tabindex="-1"><a class="header-anchor" href="#_3-3-kubernetes部署配置" aria-hidden="true">#</a> 3.3 Kubernetes部署配置</h3><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token comment"># deployment.yaml</span>
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> apps/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Deployment
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> address<span class="token punctuation">-</span>agent
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">replicas</span><span class="token punctuation">:</span> <span class="token number">3</span>
  <span class="token key atrule">template</span><span class="token punctuation">:</span>
    <span class="token key atrule">spec</span><span class="token punctuation">:</span>
      <span class="token key atrule">containers</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> address<span class="token punctuation">-</span>agent
        <span class="token key atrule">image</span><span class="token punctuation">:</span> address<span class="token punctuation">-</span>agent<span class="token punctuation">:</span>1.0.0
        <span class="token key atrule">env</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> OPENAI_KEY
          <span class="token key atrule">valueFrom</span><span class="token punctuation">:</span>
            <span class="token key atrule">secretKeyRef</span><span class="token punctuation">:</span>
              <span class="token key atrule">name</span><span class="token punctuation">:</span> ai<span class="token punctuation">-</span>secrets
              <span class="token key atrule">key</span><span class="token punctuation">:</span> api<span class="token punctuation">-</span>key
        <span class="token key atrule">resources</span><span class="token punctuation">:</span>
          <span class="token key atrule">requests</span><span class="token punctuation">:</span>
            <span class="token key atrule">memory</span><span class="token punctuation">:</span> <span class="token string">&quot;512Mi&quot;</span>
            <span class="token key atrule">cpu</span><span class="token punctuation">:</span> <span class="token string">&quot;250m&quot;</span>
          <span class="token key atrule">limits</span><span class="token punctuation">:</span>
            <span class="token key atrule">memory</span><span class="token punctuation">:</span> <span class="token string">&quot;1Gi&quot;</span>
            <span class="token key atrule">cpu</span><span class="token punctuation">:</span> <span class="token string">&quot;500m&quot;</span>
        <span class="token key atrule">readinessProbe</span><span class="token punctuation">:</span>
          <span class="token key atrule">httpGet</span><span class="token punctuation">:</span>
            <span class="token key atrule">path</span><span class="token punctuation">:</span> /actuator/health
            <span class="token key atrule">port</span><span class="token punctuation">:</span> <span class="token number">8080</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="四、小结" tabindex="-1"><a class="header-anchor" href="#四、小结" aria-hidden="true">#</a> 四、小结</h2><h3 id="_4-1-智能体-or-no" tabindex="-1"><a class="header-anchor" href="#_4-1-智能体-or-no" aria-hidden="true">#</a> 4.1 智能体 or NO?</h3><p>从上到下顺下来，我们的智能地址提取基本已经完成，从本质上来说，这是一个大模型的能力包装服务，那么它算“智能体”吗？</p><p>好像也不太算<sub>，哪个智能体这么简单呢</sub>🤣</p><p>但若从下面这些角度出发，它又算是一个非常垂直的工具增强型智能体：</p><ol><li><strong>目标导向</strong>：用户输入的是<strong>自然语言目标</strong>——“从这段文字里提取地址并查清楚它的行政区划编码”，而不是“先调用NLP模型解析，再用结果里的省市去查XX API”。</li><li><strong>自主规划与推理</strong>：系统内部自动完成了规划：① 识别出这是地址提取任务 -&gt; ② 调用LLM进行结构化解析 -&gt; ③ 判断是否需要并请求行政编码 -&gt; ④ 调用外部函数获取编码 -&gt; ⑤ 整合结果。<strong>这个决策链条是智能体自主生成的</strong>。</li><li><strong>核心工具使用</strong>：其核心能力 <code>Function Calling</code> 正是智能体的标志性特征。LLM作为“大脑”，决定使用 <code>queryAdCode</code> 这个“工具”（手或脚）。</li><li><strong>可扩展的交互与记忆</strong>：虽然当前版本可能是单次查询，但它很容易扩展为多轮对话。例如，用户说“地址不对，我指的是杭州的西湖区”，智能体可以记住上下文，重新查询。</li></ol><p><strong>对比一个非智能体的传统方案：</strong></p><p>一个传统的地址解析服务可能提供一个复杂的API表单，要求用户自己先分词，然后分别填写<code>province</code>、<code>city</code>、<code>district</code>等字段来查询编码。</p><p>用户承担了所有的规划和推理工作；而这个智能地址提取，就很“智能”了</p><h3 id="_4-2-特点" tabindex="-1"><a class="header-anchor" href="#_4-2-特点" aria-hidden="true">#</a> 4.2 特点</h3><p>最后针对本文的内容，整体小结一下：通过本文介绍的方案，我们构建了一个端到端的智能地址解析系统，具备以下特点：</p><ol><li><strong>自然语言理解</strong>：利用大模型处理各种自由格式的地址输入</li><li><strong>提示词模板</strong>：通过构建结构化的提示词管理，提高大模型的返回质量</li><li><strong>结构化输出</strong>：确保输出符合标准化要求</li><li><strong>实时编码查询</strong>：通过function call动态获取行政区域编码</li></ol><h3 id="_4-3-未来扩展方向" tabindex="-1"><a class="header-anchor" href="#_4-3-未来扩展方向" aria-hidden="true">#</a> 4.3 未来扩展方向：</h3><ol><li><strong>多模型支持</strong>：集成本地化大模型降低API成本</li><li><strong>地址补全与纠错</strong>：对不完整或错误地址进行智能修正</li><li><strong>国际化支持</strong>：处理多语言地址解析</li><li><strong>GIS集成</strong>：结合地理信息系统提供坐标映射</li><li><strong>实时更新</strong>：自动同步最新的行政区划变更</li></ol><p>通过一个简单的场景，不到200行代码，实现一个“地址提取智能体”，给大家提供一个关于大模型应用开发的案例；当然本篇内容也是作为理论科普系列教程的实战篇，强烈建议对大模型应用开发感兴趣的小伙伴，看看以下几篇内容（每篇耗时不超过五分钟😊）</p>`,22),I={href:"https://mp.weixin.qq.com/s/qCn8x2XO2shA8MheYbHq0w",target:"_blank",rel:"noopener noreferrer"},L={href:"https://mp.weixin.qq.com/s/2GXBNOUq3jlysipftz8TpA",target:"_blank",rel:"noopener noreferrer"},j={href:"https://mp.weixin.qq.com/s/v-z6EHY300ElOxdGPdzc0w",target:"_blank",rel:"noopener noreferrer"},T={href:"https://mp.weixin.qq.com/s/t_BuAW9i0npcaJdua3Am2Q",target:"_blank",rel:"noopener noreferrer"},N={href:"https://mp.weixin.qq.com/s/vzt0bGwcfnASOiBa0Kc7VQ",target:"_blank",rel:"noopener noreferrer"},D={href:"https://mp.weixin.qq.com/s/Nk-N34TLJVCTI5F4k5rGaQ",target:"_blank",rel:"noopener noreferrer"},O={href:"https://mp.weixin.qq.com/s/ZQbztqBq7_PzynG06N4-mg",target:"_blank",rel:"noopener noreferrer"},B={href:"https://mp.weixin.qq.com/s/nnKspRO87xbrn4-LBV3RNA",target:"_blank",rel:"noopener noreferrer"};function z(E,F){const a=c("ExternalLinkIcon");return o(),i("div",null,[b,n("ul",null,[g,n("li",null,[h,s("："),n("a",y,[s("Administrative-divisions-of-China"),t(a)])])]),f,n("p",null,[s("首先我们需要搭建要给SpringAI的项目，不太熟悉的小伙伴可以参照 "),n("a",q,[s("01.创建一个SpringAI的示例工程 | 一灰灰的站点"),t(a)]),s(" 来完成")]),w,n("p",null,[s("上面demo中的提示词过于简略，因此我们需要设计一个更符合工程化的提示词（有兴趣的小伙伴可以查看 "),n("a",_,[s("大模型应用开发系列教程： 第五章 从 Prompt 到 Prompt 模板与工程治理"),t(a)]),s(" 看看如何设计更推荐的提示词）")]),M,n("p",null,[s("首先是从开源项目中获取数据集："),n("a",C,[s("https://github.com/modood/Administrative-divisions-of-China"),t(a)])]),x,n("p",null,[s("对于省市区这三个相对来说比较固定的地址信息，对于街道门牌号的可能性实在是太多，大模型中有一个参数 "),A,s(" 它会控制大模型预测结果的倾向，对此有兴趣的小伙伴可以参照 "),n("a",S,[s("大模型应用开发系列教程：第二章 模型不是重点，参数才是你真正的控制面板"),t(a)])]),P,n("ul",null,[n("li",null,[n("a",I,[s("LLM 应用开发是什么：零基础也可以读懂的科普文(极简版)"),t(a)])]),n("li",null,[n("a",L,[s("大模型应用开发系列教程：序-为什么你“会用 LLM”，但做不出复杂应用？"),t(a)])]),n("li",null,[n("a",j,[s("大模型应用开发系列教程：第一章LLM到底在做什么？"),t(a)])]),n("li",null,[n("a",T,[s("大模型应用开发系列教程：第二章 模型不是重点，参数才是你真正的控制面板"),t(a)])]),n("li",null,[n("a",N,[s("大模型应用开发系列教程：第三章 为什么我的Prompt表现很糟？"),t(a)])]),n("li",null,[n("a",D,[s("大模型应用开发系列教程：第四章Prompt 的工程化结构设计"),t(a)])]),n("li",null,[n("a",O,[s("大模型应用开发系列教程：第五章 从 Prompt 到 Prompt 模板与工程治理"),t(a)])]),n("li",null,[n("a",B,[s("大模型应用开发系列教程：第六章 上下文窗口的真实边界"),t(a)])])])])}const R=p(m,[["render",z],["__file","D02.从0到1实现一个自然语言提取地址信息的智能体.html.vue"]]);export{R as default};
