/**
 * The house styles behind the onboarding question "What visual content do you
 * like?", one recipe per option id in IMAGE_QUESTION.
 *
 * The option's principle is the short version a member reads and edits in
 * settings, and a revise comment rewrites it. The recipe here is the long
 * version the image model needs to hold one look across a year of posts, and
 * nobody edits it but us. When the two disagree the principle wins, because
 * it carries the member's corrections and the recipe does not.
 *
 * Every recipe is written for the frame we draw, 4:3 landscape at the 1K tier.
 * Asking for a vertical composition inside that frame gets a cropped poster.
 */

export type ImageStyle = {
  id: "abstract" | "human" | "nature";
  /** The treatment, kept constant across every picture in the style. */
  recipe: string;
  /** What the post is allowed to decide inside the style. */
  subject: string;
  /** The subject the onboarding preview is drawn with. */
  example: string;
};

const ABSTRACT: ImageStyle = {
  id: "abstract",
  recipe: `Abstract atmospheric gradient photograph, landscape composition. A deep midnight navy to black background fills the frame, with large soft-focus fields of luminous colour drifting diagonally from lower left toward upper right. An intense electric cobalt blue glow dominates the lower half, moving through cyan and soft periwinkle into a warm peach, coral and burnt orange glow near the upper right. Colours blend like light diffusing through frosted glass or an out-of-focus aurora. Extremely smooth transitions, heavily defocused, no hard edges, no recognisable objects, no texture, no geometry. Subtle photographic grain and atmospheric haze, rich blacks, luminous saturated colours, gentle bloom around the brightest areas. Minimal, cinematic, mysterious, premium, slightly futuristic. Soft directional light, very low contrast in the transitions, deep shadows around the edges. No text, no objects, no stars, no particles, no shapes. High-end abstract background photography, shot completely out of focus, sophisticated editorial art direction.

Keep the same visual identity across the series: deep navy and black base, electric blue and cyan lower regions, warm coral, peach and orange highlights, diagonal flowing light, extreme diffusion and shallow-focus abstraction. Vary only the position, scale and balance of the colour fields.`,
  subject:
    "There is no subject. The post only decides the balance: a tense or urgent post gets more warm colour and a tighter glow, a calm or reflective one gets more blue and more dark space. Never add an object, a shape or a symbol for the topic.",
  example: "A calm, balanced arrangement with the warm glow small in the upper right.",
};

const HUMAN: ImageStyle = {
  id: "human",
  recipe: `Cinematic contemporary editorial photography with an intensely atmospheric colour treatment. The scene is dominated by deep petrol blue and cyan shadows, with a single strong warm orange or red light source striking the subject from one direction. Dramatic colour separation between cool ambient light and warm directional light. Deep blacks, soft shadow transitions, selective highlights, subtle atmospheric haze and beautiful light falloff.

The lighting feels intentional and sculptural rather than evenly lit. Large portions of the frame disappear into darkness. Strong negative space and simple backgrounds. The subject feels isolated, quiet, enigmatic and emotionally restrained. Natural, understated expression and body language.

Photorealistic, tactile skin and material texture, natural imperfections, visible pores, realistic hair, subtle film grain, slight halation, soft highlight bloom, gentle lens diffusion, cinematic dynamic range. Shot on a full-frame cinema camera with a 35mm or 50mm prime lens, shallow to moderate depth of field. Contemporary fashion editorial and art photography, album cover sensibility, sophisticated, raw, slightly surreal but completely photographic.

Palette: deep navy, petrol blue, cyan, turquoise and black, accented only by concentrated amber, orange or red light. No other strong colours. No white studio light, no glossy commercial retouching, no plastic skin, no HDR look, no excessive saturation or sharpness, no busy backgrounds, no decorative elements, no cheesy neon cyberpunk aesthetic, no clutter, no text, no logos.`,
  subject:
    "One invented person, or an object or place from the post when a person does not fit, placed in a minimal scene that echoes what the post is about. The person is never the author and never looks like a headshot: seen from behind, in profile, or with most of the face lost in shadow, so nobody could be recognised.",
  example:
    "A person standing alone at a tall window in an empty office at night, a narrow beam of amber light crossing their shoulder, face turned away.",
};

const NATURE: ImageStyle = {
  id: "nature",
  recipe: `Photorealistic cinematic travel editorial photograph, landscape composition. Iconic graphic composition, one dominant natural subject with a strong silhouette or graphic shape, occupying roughly 40 to 65 percent of the frame, generous negative space around it, strong diagonal or vertical structure, layered foreground, middle ground and background, visually clean background, immediately recognisable silhouette.

Bold saturated natural colours with a slightly surreal contemporary travel magazine aesthetic. Graphic colour blocking: intense turquoise and cobalt blues, lush saturated emerald greens, occasional unexpected coral red or hot pink accents, clean separation between colour fields, deep blacks, luminous highlights. Dramatic but believable natural light, crisp sunlight, deep atmospheric shadows, subtle haze, excellent depth separation, dramatic atmospheric scale.

Unusual but believable perspective, so the image feels discovered rather than staged. Realistic organic textures, extremely detailed vegetation, rock, water and clouds, natural imperfections, sharp focal subject with gentle depth of field falloff. High-end full-frame camera, 35mm to 50mm lens, sophisticated cinematic colour grading, subtle film grain, ultra detailed.

Real-world photography, unusually bold colour, extremely clean graphic composition, with a deliberate poster and editorial colour design quality. Never generic stock photography. No people, no text, no logos, no borders.`,
  subject:
    "A natural landscape or natural subject whose shape or mood echoes the post: a lone tree for a post about going first, a river delta for one about many small decisions. Never a business object placed in nature.",
  example: "A single cypress on a ridge above a turquoise bay, low sun from the side.",
};

export const IMAGE_STYLES: Record<ImageStyle["id"], ImageStyle> = {
  abstract: ABSTRACT,
  human: HUMAN,
  nature: NATURE,
};

/** The style an onboarding answer picked, or null for `other` and older answers. */
export function imageStyleFor(choice: string | undefined): ImageStyle | null {
  return choice && choice in IMAGE_STYLES ? IMAGE_STYLES[choice as ImageStyle["id"]] : null;
}
