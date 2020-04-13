/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

/** A S&D card */
export default interface ICard {
    /** The name of the card */
    name?: string;
    /** The casting time for the card */
    castingTime?: string;
    /** The range for the card */
    range?: string;
    /** The components that the card has */
    components?: string;
    /** The duration of the card */
    duration?: string;
    /** The physical components of the card */
    physicalComponents?: string;
    /** The class of the card */
    clazz?: string;
    /** The level of the card */
    level?: string;
    /** The type of the card */
    type?: string;
    /** The description of the card */
    description?: string;
    /** The extended description of the card */
    extDescription?: string;
    /** The image to show on the back of the card */
    image?: string;
    /** The color of the card */
    color?: string;
}