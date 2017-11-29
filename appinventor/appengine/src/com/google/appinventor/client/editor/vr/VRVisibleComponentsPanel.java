// -*- mode: java; c-basic-offset: 2; -*-
// Copyright © 2017 Massachusetts Institute of Technology, All rights reserved.

package com.google.appinventor.client.editor.vr;

import com.google.appinventor.client.editor.simple.SimpleNonVisibleComponentsPanel;
import com.google.appinventor.client.editor.simple.SimpleVisibleComponentsPanel;
import com.google.appinventor.client.editor.simple.components.MockVREditor;
import com.google.gwt.user.client.ui.AbsolutePanel;

/**
 * Visible components panel for the VR.
 */
public class VRVisibleComponentsPanel extends SimpleVisibleComponentsPanel<MockVREditor> {

  private final AbsolutePanel panel;

  /**
   * Creates new component design panel for visible components.
   *
   * @param nonVisibleComponentsPanel corresponding panel for non-visible
   *                                  components
   */
  public VRVisibleComponentsPanel(SimpleNonVisibleComponentsPanel<MockVREditor> nonVisibleComponentsPanel) {
    super(nonVisibleComponentsPanel);

    panel = new AbsolutePanel();
    initWidget(panel);
  }

  @Override
  public void setRoot(MockVREditor root) {
    this.root = root;
    panel.add(root);
  }
}
